import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { KeywordWithRanking } from './types';

/**
 * グラフなどのDOM要素を画像（Data URL）に変換する
 */
const generateElementImage = async (elementId: string, scale = 2): Promise<string | null> => {
    const element = document.getElementById(elementId);
    if (!element) return null;

    try {
        const canvas = await html2canvas(element, {
            scale: scale,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff', // 背景を白に固定
            onclone: (clonedDoc) => {
                // Force all elements to use safe colors by resetting problematic CSS variables
                const clonedElement = clonedDoc.getElementById(elementId);
                if (clonedElement) {
                    // Override any CSS variables that might use oklch/lab
                    clonedElement.style.setProperty('--background', '#ffffff');
                    clonedElement.style.setProperty('--foreground', '#000000');
                    clonedElement.style.setProperty('--primary', '#3b82f6');
                    clonedElement.style.setProperty('--border', '#e5e7eb');

                    // Force background color on all children
                    clonedElement.querySelectorAll('*').forEach((el) => {
                        const htmlEl = el as HTMLElement;
                        const computed = window.getComputedStyle(el);

                        // If background color contains oklch/lab, force it to white or transparent
                        if (computed.backgroundColor && (
                            computed.backgroundColor.includes('oklch') ||
                            computed.backgroundColor.includes('lab')
                        )) {
                            htmlEl.style.backgroundColor = 'transparent';
                        }

                        // If color (text) contains oklch/lab, force to black
                        if (computed.color && (
                            computed.color.includes('oklch') ||
                            computed.color.includes('lab')
                        )) {
                            htmlEl.style.color = '#000000';
                        }
                    });
                }
            }
        });
        return canvas.toDataURL('image/png');
    } catch (error) {
        console.error('Error generating image:', error);
        return null;
    }
};

/**
 * PDFレポートを生成してダウンロード
 * 指定されたDOM要素全体（ヘッダー、グラフ画像、テーブル等を含む）を画像化してPDFにする
 * これにより日本語の文字化け（フォント問題）を完全に回避する
 */
export const exportPDFReport = async (
    siteName: string,
    reportContainerId: string
) => {
    // レポート全体を画像化
    const reportImage = await generateElementImage(reportContainerId, 2); // 高品質のためにscale 2
    if (!reportImage) {
        throw new Error('Failed to generate report image');
    }

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const imgProps = doc.getImageProperties(reportImage);
    const imgHeight = (imgProps.height * pageWidth) / imgProps.width;

    // 画像のみを貼り付ける（余白なし、または適度な余白）
    // 横幅いっぱいに合わせる
    // doc.addImage(reportImage, 'PNG', 0, 0, pageWidth, imgHeight);

    // 高さが1ページを超えている場合、ページを追加して続きを描画する...というのは画像貼り付けだと難しいので
    // 今回は「1ページに収まるように縮小」するか「そのまま」にする。
    // レポートの長さ次第だが、A4縦に収まる前提でレイアウトを作るか、または複数ページ対応が必要。
    // 簡易的に、もし長すぎる場合は自動的にページを追加するロジックを入れる（長い画像を分割して貼る）

    // let heightLeft = imgHeight;
    // let position = 0;

    // 1ページ目
    // doc.addImage(reportImage, 'PNG', 0, position, pageWidth, imgHeight); 
    // 上記だと単純貼付だが、複数ページ対応するなら↓

    if (imgHeight <= pageHeight) {
        doc.addImage(reportImage, 'PNG', 0, 0, pageWidth, imgHeight);
    } else {
        // 複数ページにまたがる場合の簡易実装（あくまで画像分割ではなく描画位置ずらし）
        // ※ jsPDFで長い画像を分割出力するのは少しハックが必要。
        // ここではシンプルに「縮小して1ページに収める」オプションも考えられるが、
        // ユーザーは見やすさを重視するはず。
        // 一旦、A4サイズに合わせてコンテナ幅を調整してもらう前提で、
        // overflow時は縮小して1ページに収めるアプローチをとる（最も安全）。

        // 1ページに収まるように高さを調整
        const ratio = pageHeight / imgHeight;
        const newWidth = pageWidth * ratio;
        // 中央寄せ
        const xOffset = (pageWidth - newWidth) / 2;
        doc.addImage(reportImage, 'PNG', xOffset, 0, newWidth, pageHeight);
    }

    const dateStr = new Date().toLocaleDateString('ja-JP').replace(/\//g, '-');
    doc.save(`${siteName}_ranking_report_${dateStr}.pdf`);
};

/**
 * Excelレポートを生成してダウンロード
 * データのみを出力
 */
export const exportExcelReport = async (
    siteName: string,
    keywords: KeywordWithRanking[]
) => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Ranking Data');

    // データを整形: 日付 x キーワードのマトリクス
    // 1. 全ての日付を収集
    const dateSet = new Set<string>();
    keywords.forEach(kw => {
        (kw.rankings || []).forEach(r => {
            const d = new Date(r.checked_at).toISOString().split('T')[0];
            dateSet.add(d);
        });
    });
    // 日付順にソート
    const dates = Array.from(dateSet).sort();

    // 2. 列ヘッダーの設定 (A列: 日付, B列以降: キーワード)
    const columns = [
        { header: '日付', key: 'date', width: 15 },
        ...keywords.map(kw => ({
            header: `${kw.keyword} (${kw.device === 'mobile' ? 'Mobile' : 'PC'})`,
            key: kw.id,
            width: 20
        }))
    ];
    sheet.columns = columns;

    // 3. 行データの作成
    dates.forEach(dateStr => {
        const rowData: any = { date: dateStr };
        keywords.forEach(kw => {
            // その日のランクを探す
            // 同じ日に複数データがある場合は最新を採用
            const ranking = (kw.rankings || [])
                .filter(r => new Date(r.checked_at).toISOString().split('T')[0] === dateStr)
                .sort((a, b) => new Date(b.checked_at).getTime() - new Date(a.checked_at).getTime())[0];

            rowData[kw.id] = ranking ? ranking.rank : null; // rankがnullなら空欄
        });
        sheet.addRow(rowData);
    });

    // スタイル調整（ヘッダーを太字に）
    sheet.getRow(1).font = { bold: true };

    // バッファを生成して保存
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const dateStr = new Date().toLocaleDateString('ja-JP').replace(/\//g, '-');
    saveAs(blob, `${siteName}_ranking_data_${dateStr}.xlsx`);
};

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { ChatworkSiteSettings, DEFAULT_MESSAGE_TEMPLATE, ReportFrequency } from '@/types/chatwork';

interface ChatworkSettingsProps {
    siteId: string;
    siteName: string;
}

export function ChatworkSettings({ siteId, siteName }: ChatworkSettingsProps) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);

    // Form States
    const [roomId, setRoomId] = useState('');
    const [frequency, setFrequency] = useState<ReportFrequency>('weekly');
    const [reportTime, setReportTime] = useState(10);
    const [reportDayOfWeek, setReportDayOfWeek] = useState(1); // Monday
    const [reportDayOfMonth, setReportDayOfMonth] = useState(1);
    const [reportPeriod, setReportPeriod] = useState(7); // 7, 30, or 90 days
    const [reportMentionId, setReportMentionId] = useState('');
    const [reportMentionName, setReportMentionName] = useState('');
    const [template, setTemplate] = useState(DEFAULT_MESSAGE_TEMPLATE);

    const supabase = createClient();
    const { toast } = useToast();

    useEffect(() => {
        fetchSettings();
    }, [siteId]);

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('chatwork_site_settings')
                .select('*')
                .eq('site_id', siteId)
                .single();

            if (data) {
                setRoomId(data.room_id);
                setFrequency(data.report_frequency as ReportFrequency);
                setReportTime(data.report_time);
                setReportDayOfWeek(data.report_day_of_week);
                setReportDayOfMonth(data.report_day_of_month);
                setReportPeriod(data.report_period || 7);
                setReportMentionId(data.report_mention_id || '');
                setReportMentionName(data.report_mention_name || '');
                setTemplate(data.message_template || DEFAULT_MESSAGE_TEMPLATE);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!roomId) {
            toast({
                title: "エラー",
                description: "ルームIDは必須です",
                variant: 'destructive',
            });
            return;
        }

        setSaving(true);
        try {
            const { error } = await supabase
                .from('chatwork_site_settings')
                .upsert({
                    site_id: siteId,
                    room_id: roomId,
                    report_frequency: frequency,
                    report_time: reportTime,
                    report_day_of_week: reportDayOfWeek,
                    report_day_of_month: reportDayOfMonth,
                    report_period: reportPeriod,
                    report_mention_id: reportMentionId,
                    report_mention_name: reportMentionName,
                    message_template: template,
                }, { onConflict: 'site_id' });

            if (error) throw error;

            toast({
                title: "保存完了",
                description: "Chatwork設定を保存しました",
                variant: 'success',
            });
        } catch (error) {
            console.error('Error saving settings:', error);
            toast({
                title: "保存エラー",
                description: "設定の保存に失敗しました",
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    const handleTestSend = async () => {
        if (!roomId) {
            toast({
                title: "エラー",
                description: "ルームIDを入力してください",
                variant: 'destructive',
            });
            return;
        }

        setTesting(true);
        try {
            // Get API Token first (check if exists)
            const { data: tokenData } = await supabase
                .from('app_settings')
                .select('value')
                .eq('key', 'chatwork_api_token')
                .single();

            if (!tokenData?.value) {
                toast({
                    title: "設定エラー",
                    description: "Chatwork APIトークンが設定されていません。全体設定を確認してください。",
                    variant: 'destructive',
                });
                return;
            }

            const response = await fetch('/api/chatwork/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: tokenData.value,
                    roomId: roomId,
                    siteId: siteId,
                    template: template,
                    reportPeriod: reportPeriod,
                    mentionId: reportMentionId,
                    mentionName: reportMentionName
                }),
            });

            const result = await response.json();

            if (result.success) {
                toast({
                    title: "送信成功",
                    description: "テストメッセージを送信しました",
                    variant: 'success',
                });
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Test send error:', error);
            toast({
                title: "送信失敗",
                description: error instanceof Error ? error.message : "テストメッセージの送信に失敗しました",
                variant: 'destructive',
            });
        } finally {
            setTesting(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center py-8">読み込み中...</div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Chatwork連携設定</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
                このサイトの順位レポートをChatworkに自動送信します。
                <br />
                ※ APIトークンは<a href="/settings" className="underline text-primary hover:text-primary/80 transition-colors">設定ページ</a>で設定してください。
            </p>

            <Card>
                <CardContent className="pt-6 space-y-8">
                    {/* Reporting Schedule Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b">
                            <h3 className="text-sm font-semibold">報告スケジュール</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>報告頻度</Label>
                                <Select value={frequency} onValueChange={(v: ReportFrequency) => setFrequency(v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="weekly">毎週</SelectItem>
                                        <SelectItem value="monthly">毎月</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {frequency === 'weekly' ? (
                                <>
                                    <div className="space-y-2">
                                        <Label>曜日</Label>
                                        <Select value={reportDayOfWeek.toString()} onValueChange={(v) => setReportDayOfWeek(Number(v))}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="0">日曜日</SelectItem>
                                                <SelectItem value="1">月曜日</SelectItem>
                                                <SelectItem value="2">火曜日</SelectItem>
                                                <SelectItem value="3">水曜日</SelectItem>
                                                <SelectItem value="4">木曜日</SelectItem>
                                                <SelectItem value="5">金曜日</SelectItem>
                                                <SelectItem value="6">土曜日</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>時間</Label>
                                        <Select value={reportTime.toString()} onValueChange={(v) => setReportTime(Number(v))}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.from({ length: 24 }).map((_, i) => (
                                                    <SelectItem key={i} value={i.toString()}>{i}:00</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <Label>日付</Label>
                                        <Select value={reportDayOfMonth.toString()} onValueChange={(v) => setReportDayOfMonth(Number(v))}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.from({ length: 31 }).map((_, i) => (
                                                    <SelectItem key={i + 1} value={(i + 1).toString()}>{i + 1}日</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>時間</Label>
                                        <Select value={reportTime.toString()} onValueChange={(v) => setReportTime(Number(v))}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.from({ length: 24 }).map((_, i) => (
                                                    <SelectItem key={i} value={i.toString()}>{i}:00</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Chatwork Room Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b">
                            <h3 className="text-sm font-semibold">送信先</h3>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="roomId">ルームID</Label>
                            <Input
                                id="roomId"
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value)}
                                placeholder="123456789"
                                type="number"
                                className="max-w-md"
                            />
                            <p className="text-xs text-muted-foreground">
                                ChatworkのURL末尾の数字です（例: #!rid000000000 の数字部分）
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="mentionId">通知先アカウントID（任意）</Label>
                            <Input
                                id="mentionId"
                                value={reportMentionId}
                                onChange={(e) => setReportMentionId(e.target.value)}
                                placeholder="1234567"
                                className="max-w-md"
                            />
                            <p className="text-xs text-muted-foreground">
                                特定の個人にメンションを送る場合に、相手のアカウントIDを入力してください。
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="mentionName">通知先名（任意）</Label>
                            <Input
                                id="mentionName"
                                value={reportMentionName}
                                onChange={(e) => setReportMentionName(e.target.value)}
                                placeholder="〇〇さん"
                                className="max-w-md"
                            />
                            <p className="text-xs text-muted-foreground">
                                メンション時に表示される名前です。（例: [To:123] 〇〇さん）
                            </p>
                        </div>
                    </div>

                    {/* Report Period Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b">
                            <h3 className="text-sm font-semibold">レポート期間</h3>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="reportPeriod">集計期間</Label>
                            <Select value={reportPeriod.toString()} onValueChange={(v) => setReportPeriod(Number(v))}>
                                <SelectTrigger id="reportPeriod" className="max-w-md">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="7">過去7日間</SelectItem>
                                    <SelectItem value="30">過去30日間</SelectItem>
                                    <SelectItem value="90">過去90日間</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Chatworkに送信するレポートに含める期間を選択します
                            </p>
                        </div>
                    </div>

                    {/* Message Template Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b">
                            <h3 className="text-sm font-semibold">メッセージ設定</h3>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="template">メッセージテンプレート</Label>
                            <Textarea
                                id="template"
                                value={template}
                                onChange={(e) => setTemplate(e.target.value)}
                                className="h-40 font-mono text-sm resize-none"
                                placeholder="テンプレートを入力..."
                            />
                            <p className="text-xs text-muted-foreground">
                                使用可能な変数: <code className="px-1.5 py-0.5 rounded bg-muted">{'{site_name}'}</code>, <code className="px-1.5 py-0.5 rounded bg-muted">{'{period}'}</code>, <code className="px-1.5 py-0.5 rounded bg-muted">{'{rankings}'}</code>
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:justify-between pt-4">
                        <Button
                            variant="outline"
                            onClick={handleTestSend}
                            disabled={testing || !roomId}
                            className="w-full sm:w-auto"
                        >
                            {testing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                            テスト送信
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full sm:w-auto"
                        >
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            設定を保存
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

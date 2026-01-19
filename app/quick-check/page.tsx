import { QuickCheckForm } from '@/components/quick-check/QuickCheckForm';

export const metadata = {
    title: 'クイック順位チェック | SEO Researcher',
    description: 'サイトを登録せずにGoogle検索順位を即座にチェックします。',
};

export default function QuickCheckPage() {
    return (
        <div className="max-w-4xl mx-auto py-10 px-6">
            <div className="mb-10">
                <h1 className="text-4xl font-extrabold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                    サイトチェック
                </h1>
                <p className="text-muted-foreground text-lg">
                    登録不要で、特定のキーワードに対するWebサイトの現在の順位を調査します。
                </p>
            </div>

            <QuickCheckForm />
        </div>
    );
}

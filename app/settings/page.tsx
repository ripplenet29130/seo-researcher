import { ChatworkTokenForm } from '@/components/settings/ChatworkTokenForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LogOut } from 'lucide-react';
import Link from 'next/link';
import { signOut } from '@/app/actions/signOut';

export const dynamic = 'force-dynamic';

export default function SettingsPage() {
    return (
        <div className="max-w-4xl mx-auto py-10 px-8">
            <div className="mb-6">
                <Link href="/">
                    <Button variant="ghost" size="sm" className="pl-0">
                        <ArrowLeft className="mr-2 h-4 w-4" />ダッシュボードに戻る
                    </Button>
                </Link>
            </div>

            <h1 className="text-3xl font-bold tracking-tight mb-8">設定</h1>

            <div className="grid gap-8">
                <ChatworkTokenForm />

                <div className="border rounded-lg p-6 bg-card">
                    <h2 className="text-xl font-semibold mb-4 text-destructive">アカウント</h2>
                    <p className="text-sm text-muted-foreground mb-6">
                        現在ログインしているアカウントからログアウトし、セッションを終了します。
                        Google Search Consoleの連携に問題がある場合も、一度ログアウトして再ログインすることをお勧めします。
                    </p>
                    <form action={signOut}>
                        <Button variant="destructive" type="submit" className="flex items-center gap-2">
                            <LogOut className="h-4 w-4" />
                            ログアウトする
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}

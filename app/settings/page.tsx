import { ChatworkTokenForm } from '@/components/settings/ChatworkTokenForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

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
            </div>
        </div>
    );
}

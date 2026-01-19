'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export function ChatworkTokenForm() {
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showToken, setShowToken] = useState(false);
    const supabase = createClient();
    const { toast } = useToast();

    useEffect(() => {
        fetchToken();
    }, []);

    const fetchToken = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('app_settings')
                .select('value')
                .eq('key', 'chatwork_api_token')
                .single();

            if (error && error.code !== 'PGRST116') { // Ignore not found error
                console.error('Error fetching token:', error);
            }

            if (data?.value) {
                setToken(data.value);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const { error } = await supabase
                .from('app_settings')
                .upsert({
                    key: 'chatwork_api_token',
                    value: token,
                    description: 'Chatwork API Token'
                });

            if (error) throw error;

            toast({
                title: "保存完了",
                description: (
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>APIトークンを保存しました</span>
                    </div>
                ),
                variant: 'success',
            });
        } catch (error) {
            console.error('Error saving token:', error);
            toast({
                title: "保存エラー",
                description: (
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        <span>APIトークンの保存に失敗しました</span>
                    </div>
                ),
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-4 text-center">読み込み中...</div>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Chatwork API設定</CardTitle>
                <CardDescription>
                    Chatworkへの通知に使用するAPIトークンを設定します。
                    <br />
                    トークンは <a href="https://www.chatwork.com/service/packages/chatwork/subpackages/api/token.php" target="_blank" rel="noopener noreferrer" className="underline text-primary">ChatworkのAPI設定ページ</a> から取得できます。
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSave}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="token">APIトークン</Label>
                        <div className="relative">
                            <Input
                                id="token"
                                type={showToken ? "text" : "password"}
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                placeholder="Chatwork API Token"
                                className="pr-10"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowToken(!showToken)}
                            >
                                {showToken ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                            </Button>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={saving}>
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        保存する
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}

'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { updateAutoFetchSettings } from '@/app/actions/updateAutoFetchEnabled';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const FREQUENCY_OPTIONS = [
    { value: 'daily', label: '毎日' },
    { value: 'weekly', label: '毎週' },
    { value: 'monthly', label: '毎月' },
] as const;

const TIME_OPTIONS = Array.from({ length: 24 }, (_, i) => ({
    value: i,
    label: `${i}:00`,
}));

const DAY_OF_WEEK_OPTIONS = [
    { value: 0, label: '日曜日' },
    { value: 1, label: '月曜日' },
    { value: 2, label: '火曜日' },
    { value: 3, label: '水曜日' },
    { value: 4, label: '木曜日' },
    { value: 5, label: '金曜日' },
    { value: 6, label: '土曜日' },
];

const DAY_OF_MONTH_OPTIONS = Array.from({ length: 31 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1}日`,
}));

export function AutoFetchSettings({
    siteId,
    initialEnabled,
    initialFrequency = 'weekly',
    initialFetchTime = 9,
    initialFetchDayOfWeek = 1,
    initialFetchDayOfMonth = 1,
}: {
    siteId: string;
    initialEnabled: boolean;
    initialFrequency?: 'daily' | 'weekly' | 'monthly';
    initialFetchTime?: number;
    initialFetchDayOfWeek?: number;
    initialFetchDayOfMonth?: number;
}) {
    const [enabled, setEnabled] = useState(initialEnabled);
    const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>(initialFrequency);
    const [fetchTime, setFetchTime] = useState<number>(initialFetchTime);
    const [fetchDayOfWeek, setFetchDayOfWeek] = useState<number>(initialFetchDayOfWeek);
    const [fetchDayOfMonth, setFetchDayOfMonth] = useState<number>(initialFetchDayOfMonth);

    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleUpdate = async (
        newEnabled: boolean,
        newFrequency: 'daily' | 'weekly' | 'monthly',
        newFetchTime: number,
        newFetchDayOfWeek: number,
        newFetchDayOfMonth: number
    ) => {
        setLoading(true);
        // Optimistic update
        setEnabled(newEnabled);
        setFrequency(newFrequency);
        setFetchTime(newFetchTime);
        setFetchDayOfWeek(newFetchDayOfWeek);
        setFetchDayOfMonth(newFetchDayOfMonth);

        try {
            const result = await updateAutoFetchSettings(
                siteId,
                newEnabled,
                newFrequency,
                newFetchTime,
                newFetchDayOfWeek,
                newFetchDayOfMonth
            );

            if (result.error) {
                console.error('Failed to update settings:', result.error);
                toast({
                    title: "更新エラー",
                    description: (
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            <span>設定の更新に失敗しました: {result.error}</span>
                        </div>
                    ),
                    duration: 4000,
                    variant: "destructive",
                });
                return;
            }

            console.log('Settings updated successfully');

            let description = `自動更新: ${newEnabled ? 'ON' : 'OFF'}`;
            if (newEnabled) {
                if (newFrequency === 'daily') {
                    description = `毎日 ${newFetchTime}:00 に更新します`;
                } else if (newFrequency === 'weekly') {
                    const dayName = DAY_OF_WEEK_OPTIONS.find(d => d.value === newFetchDayOfWeek)?.label;
                    description = `毎週 ${dayName} ${newFetchTime}:00 に更新します`;
                } else if (newFrequency === 'monthly') {
                    description = `毎月 ${newFetchDayOfMonth}日 ${newFetchTime}:00 に更新します`;
                }
            }

            toast({
                title: "設定を保存しました",
                description: (
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>{description}</span>
                    </div>
                ),
                duration: 3000,
                variant: 'success',
            });
        } catch (error: any) {
            console.error('Unexpected error:', error);
            toast({
                title: "予期せぬエラー",
                description: (
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        <span>設定の保存中にエラーが発生しました</span>
                    </div>
                ),
                duration: 4000,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const getDescription = () => {
        if (!enabled) return null;

        if (frequency === 'daily') {
            return `毎日 ${fetchTime}:00 (JST) に更新します`;
        } else if (frequency === 'weekly') {
            const dayName = DAY_OF_WEEK_OPTIONS.find(d => d.value === fetchDayOfWeek)?.label;
            return `毎週 ${dayName} ${fetchTime}:00 (JST) に更新します`;
        } else if (frequency === 'monthly') {
            return `毎月 ${fetchDayOfMonth}日 ${fetchTime}:00 (JST) に更新します`;
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle>自動順位更新</CardTitle>
                        <CardDescription>
                            設定した頻度と時間（日本時間）に、順位を自動的に取得します。
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                        <Switch
                            id="auto-fetch"
                            checked={enabled}
                            onCheckedChange={(checked) => handleUpdate(checked, frequency, fetchTime, fetchDayOfWeek, fetchDayOfMonth)}
                            disabled={loading}
                        />
                    </div>
                </div>
            </CardHeader>

            {enabled && (
                <>
                    <CardContent className="pt-4 pb-4">
                        <div className="flex flex-wrap gap-4">
                            <div className="flex-1 min-w-[140px] space-y-1.5">
                                <Label htmlFor="frequency" className="text-xs text-muted-foreground">更新頻度</Label>
                                <Select
                                    value={frequency}
                                    onValueChange={(val) => handleUpdate(enabled, val as any, fetchTime, fetchDayOfWeek, fetchDayOfMonth)}
                                    disabled={loading}
                                >
                                    <SelectTrigger id="frequency">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {FREQUENCY_OPTIONS.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {frequency === 'weekly' && (
                                <div className="flex-1 min-w-[140px] space-y-1.5">
                                    <Label htmlFor="dayOfWeek" className="text-xs text-muted-foreground">曜日</Label>
                                    <Select
                                        value={fetchDayOfWeek.toString()}
                                        onValueChange={(val) => handleUpdate(enabled, frequency, fetchTime, parseInt(val), fetchDayOfMonth)}
                                        disabled={loading}
                                    >
                                        <SelectTrigger id="dayOfWeek">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {DAY_OF_WEEK_OPTIONS.map((option) => (
                                                <SelectItem key={option.value} value={option.value.toString()}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {frequency === 'monthly' && (
                                <div className="flex-1 min-w-[140px] space-y-1.5">
                                    <Label htmlFor="dayOfMonth" className="text-xs text-muted-foreground">日付</Label>
                                    <Select
                                        value={fetchDayOfMonth.toString()}
                                        onValueChange={(val) => handleUpdate(enabled, frequency, fetchTime, fetchDayOfWeek, parseInt(val))}
                                        disabled={loading}
                                    >
                                        <SelectTrigger id="dayOfMonth">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {DAY_OF_MONTH_OPTIONS.map((option) => (
                                                <SelectItem key={option.value} value={option.value.toString()}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="flex-1 min-w-[140px] space-y-1.5">
                                <Label htmlFor="fetchTime" className="text-xs text-muted-foreground">実行時間</Label>
                                <Select
                                    value={fetchTime.toString()}
                                    onValueChange={(val) => handleUpdate(enabled, frequency, parseInt(val), fetchDayOfWeek, fetchDayOfMonth)}
                                    disabled={loading}
                                >
                                    <SelectTrigger id="fetchTime">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TIME_OPTIONS.map((option) => (
                                            <SelectItem key={option.value} value={option.value.toString()}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="bg-muted/50 border-t">
                        <p className="text-sm text-emerald-600 font-medium">
                            ✅ {getDescription()}
                        </p>
                    </CardFooter>
                </>
            )}
        </Card>
    );
}

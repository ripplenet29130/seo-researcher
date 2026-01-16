import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function SiteDetailLoading() {
    return (
        <div className="container mx-auto p-6 space-y-8">
            {/* Header Skeleton */}
            <div className="space-y-4">
                <Skeleton className="h-4 w-32" />
                <div className="flex justify-between items-start border-b pb-6">
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-64" />
                        <Skeleton className="h-5 w-48" />
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-9 w-32" />
                        <Skeleton className="h-9 w-32" />
                    </div>
                </div>
            </div>

            {/* Auto Fetch Settings Skeleton */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-4">
                        <Skeleton className="h-6 w-12 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                </CardContent>
            </Card>

            {/* Keywords Table Skeleton */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-9 w-32" />
                </div>
                <div className="rounded-md border p-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center space-x-4 py-3 border-b last:border-0">
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-6 w-10 rounded-full" />
                            <Skeleton className="h-4 w-1/6" />
                            <Skeleton className="h-4 w-1/6" />
                            <Skeleton className="h-8 w-8 ml-auto" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function DashboardLoading() {
    return (
        <div className="container mx-auto p-6 space-y-8">
            <div>
                <Skeleton className="h-10 w-64 mb-2" />
                <Skeleton className="h-4 w-96" />
            </div>

            {/* Summary Cards Skeleton */}
            <div className="grid gap-4 md:grid-cols-2">
                {[1, 2].map((i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-4 rounded-full" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16 mb-2" />
                            <Skeleton className="h-3 w-32" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Sites Table Skeleton */}
            <div className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <div className="rounded-md border">
                    <div className="p-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center space-x-4 py-3">
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-4 w-1/3" />
                                <Skeleton className="h-6 w-12" />
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-8 w-20 ml-auto" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

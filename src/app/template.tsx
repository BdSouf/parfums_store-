import { PageReady } from '@/components/page-ready';

export default function Template({ children }: { children: React.ReactNode }) {
 return <PageReady>{children}</PageReady>;
}

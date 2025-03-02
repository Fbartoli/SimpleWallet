'use client';

import MobileFooter from '@/app/components/MobileFooter';
import { usePathname } from 'next/navigation';

export default function MobileFooterWrapper() {
    const pathname = usePathname();

    // Don't render the footer on the home page
    if (pathname === '/' || pathname === '') {
        return null;
    }

    return <MobileFooter />;
} 
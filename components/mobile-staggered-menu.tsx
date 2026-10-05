'use client';

import StaggeredMenu, { StaggeredMenuItem, StaggeredMenuSocialItem } from './StaggeredMenu';
import { navLinks } from '@/lib/navigation';

const socialItems: StaggeredMenuSocialItem[] = [
  { label: 'Instagram', link: 'https://www.instagram.com/tdc.pbl?igsh=cGtjZnlrNTRrYjNk' },
  { label: 'LinkedIn', link: 'https://www.linkedin.com/company/technocrats-developer-community/' },
  { label: 'GitHub', link: 'https://github.com/technocrats-developer-community' }
];

export function MobileStaggeredMenu() {
  const menuItems: StaggeredMenuItem[] = navLinks.map((link) => ({
    label: link.label,
    ariaLabel: `Go to ${link.label.toLowerCase()} page`,
    link: link.href
  }));

  return (
    <div className="block md:hidden">
      <StaggeredMenu
        position="right"
        items={menuItems}
        socialItems={socialItems}
        displaySocials={true}
        displayItemNumbering={true}
        menuButtonColor="#000"
        openMenuButtonColor="#fff"
        changeMenuColorOnOpen={true}
        colors={['#666666', '#1a1a1a']}
        accentColor="#666666"
        logoUrl=""
        isFixed={true}
      />
    </div>
  );
}

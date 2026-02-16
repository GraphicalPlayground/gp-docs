import React, { type ReactNode } from 'react';
import clsx from 'clsx';
import { ThemeClassNames } from '@docusaurus/theme-common';
import type { Props } from '@theme/Footer/Layout';
import styles from './styles.module.css';

export default function FooterLayout({ style, links, logo, copyright }: Props): ReactNode {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const socialIcons = [
    {
      name: 'X',
      icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z'
    },
    {
      name: 'Facebook',
      icon: 'M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396v8.01Z'
    },
    {
      name: 'Twitch',
      icon: 'M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6.857 0L2 4.857v15.429h5.143V26l4.857-4.857h3.429L22 14.571V0zm13.572 13.714l-3.429 3.429h-3.429l-3 3v-3H6.857V1.714h13.572z'
    },
    {
      name: 'Instagram',
      icon: 'M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4zm9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3'
    },
    {
      name: 'YouTube',
      icon: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814M9.545 15.568V8.432L15.818 12z'
    },
    {
      name: 'RSS',
      icon: 'M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27zm0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93z'
    }
  ];

  return (
    <footer
      className={clsx(ThemeClassNames.layout.footer.container, styles.footerContainer, 'footer', {
        'footer--dark': style === 'dark'
      })}
    >
      <div className='container container-fluid'>
        {/* Top Section - Logo and Social Icons */}
        <section className={styles.topSection}>
          {logo && <div className={styles.logoWrapper}>{logo}</div>}
          <div className={styles.socialIconsWrapper}>
            {socialIcons.map((social) => (
              <a key={social.name} href='#' className={styles.socialIcon} aria-label={social.name} title={social.name}>
                <svg width='24' height='24' viewBox='0 0 24 24' fill='currentColor'>
                  <path d={social.icon} />
                </svg>
              </a>
            ))}
          </div>
        </section>

        {/* Middle Section - Footer Links */}
        {links && (
          <section className={styles.linksSection}>
            <hr className={styles.separator} />
            <div className={styles.linksWrapper}>{links}</div>
            <hr className={styles.separator} />
          </section>
        )}

        {/* Bottom Section - Copyright and Back to Top */}
        <section className={styles.bottomSection}>
          <div className={styles.bottomLeft}>
            {copyright && <div className={styles.copyrightWrapper}>{copyright}</div>}
            <ul className={styles.legalLinks}>
              <li>
                <a href='/terms'>Terms of Service</a>
              </li>
              <li>
                <a href='/privacy'>Privacy Policy</a>
              </li>
              <li>
                <a href='/security'>Safety & Security</a>
              </li>
              <li>
                <a href='#'>Cookies Settings</a>
              </li>
            </ul>
          </div>
          <button className={styles.backToTop} onClick={scrollToTop} aria-label='Back to top'>
            <span className={styles.backToTopText}>Back to top</span>
            <svg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
              <path d='M12 2.25c5.385 0 9.75 4.365 9.75 9.75s-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12 6.615 2.25 12 2.25m0 1.5a8.25 8.25 0 1 0 0 16.5 8.25 8.25 0 0 0 0-16.5m4.03 7.22a.75.75 0 1 1-1.06 1.06l-2.22-2.22V16a.75.75 0 0 1-1.5 0V9.81l-2.22 2.22a.75.75 0 1 1-1.06-1.06L12 6.94z'></path>
            </svg>
          </button>
        </section>
      </div>
    </footer>
  );
}

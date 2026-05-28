import type { ReactNode } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`Welcome to ${siteConfig.title}`}
      description='Comprehensive documentation for the Graphical Playground engine'
    >
      <div className='top-0 z-0 flex min-h-100 md:min-h-150 w-full flex-col items-center bg-white bg-[radial-gradient(#00000020_1px,#ffffff_1px)] bg-size-[20px_20px] px-4 md:px-6 pt-24 md:pt-32 lg:pt-48 pb-16'>
        <h1 className='mx-auto max-w-5xl text-center text-4xl sm:text-5xl md:text-6xl lg:text-[72px] font-normal leading-tight lg:leading-none tracking-[-0.02em] text-black'>
          Guides, APIs, and examples
          <br className='hidden md:block' /> {' for '}
          <span className='relative inline-block whitespace-nowrap'>
            <span className='absolute -left-1 sm:-left-2 bottom-1 sm:bottom-2 -z-10 h-[60%] w-[105%] -rotate-2 rounded-md bg-[#EAD8FE]'></span>
            Graphical Playground
          </span>
        </h1>

        <p className='mt-6 md:mt-8 max-w-xl text-center text-base sm:text-lg md:text-xl text-black leading-relaxed'>
          Accelerates onboarding, clarifies complex APIs, and provides comprehensive examples for every feature.
        </p>

        <div className='mt-8 md:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row lg:flex-wrap items-center justify-center gap-4'>
          <Link
            href='/docs/guides'
            className='w-full sm:w-auto text-center bg-[#ECFF77] border border-[#ECFF77] rounded-xl px-8 py-3 text-black cursor-pointer font-medium transition-all duration-150 hover:bg-[#d9ec5e] active:bg-[#c8db4f] no-underline'
          >
            Discover Guides
          </Link>
          <Link
            href='/docs/gp-engine/Introduction'
            className='w-full sm:w-auto text-center bg-transparent border border-black rounded-xl px-8 py-3 text-black cursor-pointer font-medium transition-all duration-150 hover:bg-black hover:text-white active:bg-gray-800 no-underline'
          >
            Explore API Reference
          </Link>
          <Link
            href='/docs/api/intro'
            className='w-full sm:w-auto text-center bg-transparent border border-black rounded-xl px-8 py-3 text-black cursor-pointer font-medium transition-all duration-150 hover:bg-black hover:text-white active:bg-gray-800 no-underline'
          >
            Platform API Reference
          </Link>
          <Link
            href='/blog'
            className='w-full sm:w-auto text-center bg-transparent border border-black rounded-xl px-8 py-3 text-black cursor-pointer font-medium transition-all duration-150 hover:bg-black hover:text-white active:bg-gray-800 no-underline'
          >
            Read Blog Posts
          </Link>
        </div>

        <div className='container mx-auto mt-12 md:mt-24 px-4 md:px-0'>
          <div className='relative w-full h-[400px] sm:h-[500px] md:h-[600px] rounded-xl overflow-hidden shadow-lg'>
            <img src='/images/dither/the-witcher-4.png' alt='background' className='w-full h-full object-cover' />

            <div className='absolute bottom-8 sm:bottom-[20%] md:bottom-[30%] left-4 sm:left-8 md:left-12 lg:left-24 flex flex-col items-start gap-2 md:gap-3 max-w-[90%]'>
              <span className='bg-[#e9ff6b] ml-4 md:ml-8 lg:ml-12 text-black px-3 py-1 md:px-4 md:py-1 rounded-full text-lg sm:text-xl md:text-2xl lg:text-3xl tracking-tight whitespace-nowrap shadow-sm'>
                Start blank
              </span>

              <span className='bg-[#e9ff6b] text-black px-3 py-1 md:px-4 md:py-1 rounded-full text-lg sm:text-xl md:text-2xl lg:text-3xl tracking-tight whitespace-nowrap shadow-sm'>
                Harness advanced shaders
              </span>

              <span className='bg-[#e9ff6b] ml-8 md:ml-16 lg:ml-32 text-black px-3 py-1 md:px-4 md:py-1 rounded-full text-lg sm:text-xl md:text-2xl lg:text-3xl tracking-tight whitespace-nowrap shadow-sm'>
                Ship beautiful graphics
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className='bg-[#f5f5f0] text-black py-16 md:py-24'>
        <div className='container mx-auto px-4 md:px-6'>
          <p className='text-black/50 text-xs font-medium tracking-widest uppercase mb-4'>Documentation</p>
          <h2 className='text-3xl md:text-4xl lg:text-5xl font-normal tracking-tight text-black leading-tight mb-3'>
            Everything in one place
          </h2>
          <p className='text-black/55 text-base md:text-lg leading-relaxed mb-10 md:mb-12 max-w-xl'>
            Guides, API references, and updates. All the resources you need to build with Graphical Playground.
          </p>
          <div className='flex flex-wrap gap-3'>
            {[
              { label: 'Guides', href: '/docs/guides' },
              { label: 'Engine API', href: '/docs/gp-engine/Introduction' },
              { label: 'Platform API', href: '/docs/api/intro' },
              { label: 'Blog', href: '/blog' }
            ].map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className='inline-flex items-center border border-black/20 text-black/70 rounded-full px-8 py-3.5 text-base font-medium no-underline hover:bg-black hover:text-white hover:border-black transition-all duration-150'
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className='bg-white bg-[radial-gradient(#00000020_1px,#ffffff_1px)] bg-size-[20px_20px] text-black py-16 md:py-24'>
        <div className='container mx-auto px-4 md:px-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            <div className='relative rounded-2xl overflow-hidden h-[460px] md:h-auto md:row-span-2'>
              <img src='/images/dither/library.png' alt='Graphical Playground' className='w-full h-full object-cover' />
              <div className='absolute bottom-8 left-6 md:left-8 flex flex-col items-start gap-2 md:gap-3'>
                <span className='bg-[#e9ff6b] text-black px-3 py-1 md:px-4 md:py-1.5 rounded-full text-xl md:text-2xl lg:text-3xl font-medium tracking-tight shadow-sm'>
                  Free forever
                </span>
                <span className='bg-[#e9ff6b] ml-8 md:ml-12 text-black px-3 py-1 md:px-4 md:py-1.5 rounded-full text-xl md:text-2xl lg:text-3xl font-medium tracking-tight shadow-sm'>
                  No royalties
                </span>
                <span className='bg-[#e9ff6b] ml-4 md:ml-6 text-black px-3 py-1 md:px-4 md:py-1.5 rounded-full text-xl md:text-2xl lg:text-3xl font-medium tracking-tight shadow-sm'>
                  Open source
                </span>
              </div>
            </div>

            <div className='rounded-2xl bg-[#CCFACC] p-8 md:p-10 flex flex-col justify-between'>
              <div>
                <h2 className='text-4xl md:text-5xl font-normal tracking-tight text-black leading-tight'>Licensing</h2>
                <p className='mt-4 text-black/65 text-base md:text-lg leading-relaxed'>
                  We've streamlined our license terms so you can focus on creating. Built on open-source principles,
                  giving you absolute freedom locally, with scalable cloud power when you need it.
                </p>
              </div>
              <div className='flex flex-wrap gap-3 mt-6'>
                <Link
                  href='https://graphical-playground.com/download'
                  className='bg-black text-white px-5 py-2.5 rounded-xl text-sm font-medium no-underline hover:bg-black/80 transition-colors duration-150'
                >
                  Download now
                </Link>
                <Link
                  href='https://graphical-playground.com/faq'
                  className='bg-black/10 text-black px-5 py-2.5 rounded-xl text-sm font-medium no-underline hover:bg-black/20 transition-colors duration-150'
                >
                  View FAQ
                </Link>
              </div>
            </div>

            <div className='rounded-2xl bg-[#ECFF77] p-8 md:p-10'>
              <h3 className='text-2xl md:text-3xl font-normal tracking-tight text-black'>Free</h3>
              <p className='text-black/50 text-sm mt-1 mb-5'>For individuals & small teams</p>
              <ul className='flex flex-col gap-3 p-0 m-0'>
                {[
                  'Access to the full open-source code',
                  'Unlimited Local Computing',
                  'Standard Cloud Tier included',
                  'Forums and documentation access'
                ].map((feature) => (
                  <li key={feature} className='flex items-start gap-2.5 text-black text-sm md:text-base list-none'>
                    <svg className='w-5 h-5 shrink-0 mt-0.5 fill-black' viewBox='0 0 24 24'>
                      <path d='M12 2.25c5.385 0 9.75 4.365 9.75 9.75s-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12 6.615 2.25 12 2.25m5.03 6.22a.75.75 0 0 0-1.06 0l-5.47 5.47-2.47-2.47a.75.75 0 1 0-1.06 1.06l3.53 3.53 6.53-6.53a.75.75 0 0 0 0-1.06' />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-3 mt-3'>
            <div className='rounded-2xl bg-[#EAD8FE] p-8 md:p-10'>
              <h3 className='text-2xl md:text-3xl font-normal tracking-tight text-black'>Pro Cloud</h3>
              <p className='text-black/50 text-sm mt-1 mb-4'>For active creators & small studios</p>
              <p className='text-black/65 text-sm md:text-base leading-relaxed'>
                Extended cloud computing hours, priority queueing, and expanded cloud storage. No royalties on your
                final product, ever.
              </p>
            </div>

            <div className='rounded-2xl bg-[#bde2f8] p-8 md:p-10'>
              <h3 className='text-2xl text-black md:text-3xl font-normal tracking-tight'>Enterprise</h3>
              <p className='text-black/40 text-sm mt-1 mb-4'>For large studios</p>
              <p className='text-black/65 text-sm md:text-base leading-relaxed'>
                Dedicated cloud servers, custom pipeline integrations, guaranteed uptime, and direct technical support
                from the Graphical Playground team.
              </p>
            </div>
          </div>

          <Link
            href='https://graphical-playground.com/licensing'
            className='mt-3 flex rounded-2xl p-6 md:p-8 bg-[#f5f5f0] hover:bg-[#e0e0d8] items-center justify-center no-underline transition-colors duration-300 ease-in-out'
          >
            <div className='flex items-center gap-2 text-black text-sm md:text-base'>
              Read more about licensing
              <svg className='w-5 h-5 fill-black/90' viewBox='0 0 24 24'>
                <path d='M12 2.25c5.385 0 9.75 4.365 9.75 9.75s-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12 6.615 2.25 12 2.25m1.03 5.72a.75.75 0 1 0-1.06 1.06l2.22 2.22H8a.75.75 0 0 0 0 1.5h6.19l-2.22 2.22a.75.75 0 1 0 1.06 1.06L17.06 12z' />
              </svg>
            </div>
          </Link>
        </div>
      </div>
    </Layout>
  );
}

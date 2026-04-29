import type { ReactNode } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

const featureCards: {
  title: string;
  description: string;
  href: string;
  svgPath: string;
  startColor: string;
  stopColor: string;
}[] = [
  {
    title: 'Tutorials',
    description: 'The latest courses and tutorials from our experts.',
    href: 'https://graphical-playground.com/tutorials',
    svgPath:
      'M9.727 3.387a4.75 4.75 0 0 1 4.548 0l8.28 4.515a1.25 1.25 0 0 1 0 2.196l-1.804.983V16c0 1.705-1.36 2.896-2.937 3.62-1.62.742-3.733 1.13-5.813 1.13-1.462 0-2.939-.194-4.25-.566v.017A1.499 1.499 0 0 1 7 23a1.5 1.5 0 0 1-.75-2.799v-.556l-.063-.026C4.61 18.896 3.251 17.705 3.251 16v-4.919l-1.805-.983a1.25 1.25 0 0 1 0-2.196zm4.548 11.226a4.75 4.75 0 0 1-4.548 0L7.75 13.535v5.082c1.241.406 2.735.633 4.25.633 1.92 0 3.808-.362 5.188-.994 1.421-.652 2.062-1.462 2.062-2.256v-4.1zM4.751 16c0 .68.471 1.37 1.5 1.965v-5.248l-1.5-.818zm8.807-11.297a3.25 3.25 0 0 0-3.114 0L2.567 9l4.177 2.278 4.871-2.922a.75.75 0 0 1 .772 1.288L8.27 12.11l2.173 1.186c.97.529 2.144.529 3.114 0L21.434 9z',
    startColor: 'rgb(223, 186, 248)',
    stopColor: 'rgb(51, 191, 255)'
  },
  {
    title: 'Documentation',
    description: 'Comprehensive resources to learn how to use GP Engine.',
    href: 'http://docs.graphical-playground.com/docs/gp-engine/Introduction',
    svgPath:
      'M13.379 2.25a2.25 2.25 0 0 1 1.59.66l4.122 4.12c.422.422.659.994.659 1.591V19.5a2.25 2.25 0 0 1-2.25 2.25h-11a2.25 2.25 0 0 1-2.25-2.25v-15A2.25 2.25 0 0 1 6.5 2.25zM6.5 3.75a.75.75 0 0 0-.75.75v15c0 .414.336.75.75.75h11a.75.75 0 0 0 .75-.75V9.75H14A1.75 1.75 0 0 1 12.25 8V3.75zm6.5 12.5a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1 0-1.5zm2-3a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1 0-1.5zM13.75 8c0 .138.112.25.25.25h4.148a.8.8 0 0 0-.118-.16l-4.12-4.12a.8.8 0 0 0-.16-.118z',
    startColor: 'rgb(241, 184, 221)',
    stopColor: 'rgb(134, 138, 253)'
  },
  {
    title: 'Project Samples',
    description: 'Discover GP Engine through various content examples.',
    href: 'https://github.com/GraphicalPlayground/gp-project-samples',
    svgPath:
      'M17.076 3.25a4.75 4.75 0 0 1 4.694 4.017l1.526 9.771a3.216 3.216 0 0 1-5.597 2.613l-2.54-2.901H8.841l-2.54 2.901a3.216 3.216 0 0 1-5.597-2.613l1.527-9.771A4.75 4.75 0 0 1 6.924 3.25zM6.924 4.75a3.25 3.25 0 0 0-3.211 2.748L2.186 17.27a1.716 1.716 0 0 0 2.987 1.394l2.763-3.158a.75.75 0 0 1 .564-.256h7a.75.75 0 0 1 .565.256l2.762 3.158a1.718 1.718 0 0 0 2.988-1.395L20.287 7.5a3.25 3.25 0 0 0-3.21-2.749zM8 7.125a.75.75 0 0 1 .75.75V9.25h1.375a.75.75 0 1 1 0 1.5H8.75v1.375a.75.75 0 0 1-1.5 0V10.75H5.875a.75.75 0 0 1 0-1.5H7.25V7.875a.75.75 0 0 1 .75-.75m7 3.125a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5m2.75-3a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5',
    startColor: 'rgb(254, 180, 180)',
    stopColor: 'rgb(187, 107, 240)'
  },
  {
    title: 'Snippets',
    description: 'Code or script snippets to use in your projects.',
    href: '#',
    svgPath:
      'M8.379 3.25a2.25 2.25 0 0 1 1.59.66l2.342 2.34H19.5a2.25 2.25 0 0 1 2.25 2.25v10a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25v-13A2.25 2.25 0 0 1 4.5 3.25zM4.5 4.75a.75.75 0 0 0-.75.75v13c0 .414.336.75.75.75h15a.75.75 0 0 0 .75-.75v-10a.75.75 0 0 0-.75-.75H12a.75.75 0 0 1-.53-.22L8.91 4.97a.75.75 0 0 0-.531-.22z',
    startColor: 'rgb(255, 198, 163)',
    stopColor: 'rgb(225, 102, 182)'
  },
  {
    title: 'Roadmap',
    description: 'View the roadmap for an overview of upcoming features and GP Engine updates.',
    href: 'https://graphical-playground.com/roadmap',
    svgPath:
      'M12 2.25A7.75 7.75 0 0 1 19.75 10c0 3.277-1.9 6.203-3.686 8.244a24.7 24.7 0 0 1-3.303 3.122 14 14 0 0 1-.3.226l-.018.013-.005.003-.002.001v.001L12 21l.435.61a.75.75 0 0 1-.87 0L12 21l-.437.61-.002-.002-.004-.003-.019-.013a9 9 0 0 1-.299-.226 24.7 24.7 0 0 1-3.304-3.122C6.15 16.203 4.25 13.277 4.25 10A7.75 7.75 0 0 1 12 2.25m0 1.5A6.25 6.25 0 0 0 5.75 10c0 2.723 1.6 5.297 3.314 7.256A23 23 0 0 0 12 20.054a23 23 0 0 0 2.935-2.798C16.65 15.297 18.25 12.723 18.25 10A6.25 6.25 0 0 0 12 3.75m0 3a3.25 3.25 0 1 1 0 6.5 3.25 3.25 0 0 1 0-6.5m0 1.5a1.75 1.75 0 1 0 0 3.5 1.75 1.75 0 0 0 0-3.5',
    startColor: 'rgb(252, 215, 150)',
    stopColor: 'rgb(253, 94, 94)'
  }
];

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`Welcome to ${siteConfig.title}`}
      description='Comprehensive documentation for the Graphical Playground engine'
    >
      <style>{`:root { --layout-gradient-color: transparent; --layout-bg-color: transparent; }`}</style>

      <div className='w-full bg-[#18181c]'>
        <div className='container flex flex-col gap-0 items-start xl:py-20!'>
          <div className='flex flex-row w-full gap-2.5 justify-between items-end text-start'>
            <div className='flex flex-col gap-6 items-start'>
              <div className='flex flex-col justify-start max-w-164 gap-6'>
                <h2 className='textStyle_heading2XL text-white'>How to get started in Graphical Playground</h2>
                <span className='textStyle_paragraphMD text-[rgba(255,255,255,0.65)]'>
                  New to open-source 3D development? Making the switch from a proprietary engine? Wherever you're coming
                  from, we've got the tutorials, documentation, and sample projects to help you harness the power of
                  local computing and scale with the cloud.
                </span>
              </div>
            </div>
          </div>
          <div className='h-6'></div>
          <span className='italic text-amber-300'>This section is still under construction.</span>
        </div>
      </div>

      <div className='container flex flex-col gap-0 items-start xl:py-20!'>
        <div className='flex items-center gap-2.5 flex-row'>
          <div className='flex items-stretch justify-stretch aspect-square'>
            <img src='/img/logo.svg' alt='Graphical Playground Logo' className='w-6 h-6' />
          </div>
          <span className='textStyle_headingSM text-white'>Developer Community</span>
        </div>
        <div className='h-6'></div>
        <div className='flex flex-row w-full gap-2.5 justify-between items-end text-start'>
          <div className='flex flex-col gap-6 items-start'>
            <div className='flex flex-col justify-start max-w-164 gap-6'>
              <p className='textStyle_heading2XL text-white'>
                Learn new skills. Connect with people like you.{' '}
                <span className='cosmos-gradient'>Join the Graphical Playground Developer Community.</span>
              </p>
            </div>
          </div>
        </div>
        <div className='h-8'></div>
        <div className='w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4'>
          {featureCards.map((card, index) => (
            <div
              key={index}
              className='items-center flex-col flex p-5 text-center gap-4 relative bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.05)] rounded-3xl hover:bg-[rgba(255,255,255,0.1)] transition-colors duration-300 ease-in-out'
            >
              <Link className='inset-0 absolute outline-none' href={card.href}></Link>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='0'
                height='0'
                style={{ position: 'absolute', visibility: 'hidden', zIndex: -1 }}
              >
                <defs>
                  <linearGradient id={`icon-gradient-${index}`} x1='85%' y1='15%' x2='15%' y2='85%'>
                    <stop offset='0%' style={{ stopColor: card.startColor, stopOpacity: 1 }}></stop>
                    <stop offset='100%' style={{ stopColor: card.stopColor, stopOpacity: 1 }}></stop>
                  </linearGradient>
                </defs>
              </svg>
              <svg
                aria-hidden='true'
                style={{ fill: `url(#icon-gradient-${index})` }}
                className='w-10 h-10'
                width='24'
                height='24'
                viewBox='0 0 24 24'
              >
                <path fill-opacity='.95' d={card.svgPath}></path>
              </svg>
              <div className='flex flex-col gap-2 items-center'>
                <h3 className='textStyle_headingSM text-white m-0!'>{card.title}</h3>
                <div className='textStyle_paragraphSM text-[rgba(255,255,255,0.65)] text-ellipsis line-clamp-2 overflow-hidden'>
                  {card.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className='container relative'>
        <hr />
      </div>

      <div className='container flex flex-col gap-12 items-start xl:py-20!'>
        <div className='flex flex-row w-full gap-2.5 justify-between items-end text-start'>
          <div className='flex flex-col gap-6 items-start'>
            <div className='flex flex-col justify-start max-w-164 gap-6'>
              <h2 className='textStyle_heading2XL text-white'>Licensing</h2>
              <span className='textStyle_paragraphMD text-[rgba(255,255,255,0.65)]'>
                We've streamlined our license terms so you can focus on creating. Graphical Playground is built on
                open-source principles, giving you absolute freedom locally, with scalable cloud power when you need it.
                Need something designed just for your studio? Work with us to create a custom enterprise license. Visit
                our <a href='https://graphical-playground.com/faq'>FAQ</a> or reach out to the community if you have any
                questions.
              </span>
            </div>
          </div>
        </div>
        <div className='flex flex-col gap-2.5 items-stretch w-full'>
          <h3 className='textStyle_headingLG text-white'>For Individuals & Small Teams</h3>
          <div className='flex flex-col gap-4 w-full relative bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.05)] rounded-3xl p-8'>
            <div className='flex flex-col gap-8 md:flex-row items-start'>
              <div className='w-full flex flex-col gap-4'>
                <h4 className='textStyle_headingLG text-white m-0!'>Free</h4>
                <ul className='list-outside list-disc items-start flex-col flex ps-0.5! gap-4 bullets m-0!'>
                  <li>
                    <span className='text-[rgba(255,255,255,0.65)] textStyle_paragraphMD'>
                      <p className='m-0!'>
                        <strong className='text-white'>Hobbyists and Indie Developers</strong> (100% free forever for
                        all local computing and open-source engine usage)
                      </p>
                    </span>
                  </li>
                  <li>
                    <span className='text-[rgba(255,255,255,0.65)] textStyle_paragraphMD'>
                      <p className='m-0!'>
                        <strong className='text-white'>Individuals and small businesses</strong> (Unlimited local
                        computing. Includes a basic monthly allowance for Graphical Playground Cloud)
                      </p>
                    </span>
                  </li>
                  <li>
                    <span className='text-[rgba(255,255,255,0.65)] textStyle_paragraphMD'>
                      <p className='m-0!'>
                        <strong className='text-white'>For educators and schools</strong> (No revenue limits. Expanded
                        free cloud computing grants available for classroom environments)
                      </p>
                    </span>
                  </li>
                </ul>
              </div>
              <div className='w-full flex flex-col gap-6'>
                <ul className='flex items-start flex-col gap-4 m-0! p-0!'>
                  <li className='text-white list-inside list-none ps-0'>
                    <div className='flex flex-row gap-2 items-start ps-0'>
                      <svg
                        aria-hidden='true'
                        className='w-6 h-6 fill-[#26bbff] shrink-0'
                        width='24'
                        height='24'
                        viewBox='0 0 24 24'
                      >
                        <path
                          fill-opacity='.95'
                          d='M12 2.25c5.385 0 9.75 4.365 9.75 9.75s-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12 6.615 2.25 12 2.25m5.03 6.22a.75.75 0 0 0-1.06 0l-5.47 5.47-2.47-2.47a.75.75 0 1 0-1.06 1.06l3.53 3.53 6.53-6.53a.75.75 0 0 0 0-1.06'
                        ></path>
                      </svg>
                      <div className='textStyle_paragraphMD'>Access to the full open-source code</div>
                    </div>
                  </li>
                  <li className='text-white list-inside list-none ps-0'>
                    <div className='flex flex-row gap-2 items-start ps-0'>
                      <svg
                        aria-hidden='true'
                        className='w-6 h-6 fill-[#26bbff] shrink-0'
                        width='24'
                        height='24'
                        viewBox='0 0 24 24'
                      >
                        <path
                          fill-opacity='.95'
                          d='M12 2.25c5.385 0 9.75 4.365 9.75 9.75s-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12 6.615 2.25 12 2.25m5.03 6.22a.75.75 0 0 0-1.06 0l-5.47 5.47-2.47-2.47a.75.75 0 1 0-1.06 1.06l3.53 3.53 6.53-6.53a.75.75 0 0 0 0-1.06'
                        ></path>
                      </svg>
                      <div className='textStyle_paragraphMD'>
                        Unlimited Local Computing (utilize your own hardware without restrictions)
                      </div>
                    </div>
                  </li>
                  <li className='text-white list-inside list-none ps-0'>
                    <div className='flex flex-row gap-2 items-start ps-0'>
                      <svg
                        aria-hidden='true'
                        className='w-6 h-6 fill-[#26bbff] shrink-0'
                        width='24'
                        height='24'
                        viewBox='0 0 24 24'
                      >
                        <path
                          fill-opacity='.95'
                          d='M12 2.25c5.385 0 9.75 4.365 9.75 9.75s-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12 6.615 2.25 12 2.25m5.03 6.22a.75.75 0 0 0-1.06 0l-5.47 5.47-2.47-2.47a.75.75 0 1 0-1.06 1.06l3.53 3.53 6.53-6.53a.75.75 0 0 0 0-1.06'
                        ></path>
                      </svg>
                      <div className='textStyle_paragraphMD'>
                        Standard Cloud Tier (<a href='https://graphical-playground.com/pricing'>Learn more</a>)
                      </div>
                    </div>
                  </li>
                  <li className='text-white list-inside list-none ps-0'>
                    <div className='flex flex-row gap-2 items-start ps-0'>
                      <svg
                        aria-hidden='true'
                        className='w-6 h-6 fill-[#26bbff] shrink-0'
                        width='24'
                        height='24'
                        viewBox='0 0 24 24'
                      >
                        <path
                          fill-opacity='.95'
                          d='M12 2.25c5.385 0 9.75 4.365 9.75 9.75s-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12 6.615 2.25 12 2.25m5.03 6.22a.75.75 0 0 0-1.06 0l-5.47 5.47-2.47-2.47a.75.75 0 1 0-1.06 1.06l3.53 3.53 6.53-6.53a.75.75 0 0 0 0-1.06'
                        ></path>
                      </svg>
                      <div className='textStyle_paragraphMD'>
                        Forums and documentation on the Graphical Playground Developer Community
                      </div>
                    </div>
                  </li>
                </ul>
                <div className='flex items-center flex-wrap shrink-0 gap-4'>
                  <Link
                    className='relative justify-center items-center text-center transition-colors! ease-in-out! duration-100! shrink-0 min-h-10 rounded-lg py-2 px-4 text-[#101014]! no-underline! bg-[#26bbff] hover:bg-[#72d3ff] max-w-fit inline-flex cursor-pointer whitespace-nowrap textStyle_buttonMD'
                    href='https://graphical-playground.com/download'
                  >
                    Download now
                  </Link>
                  <Link
                    className='relative justify-center items-center text-center transition-colors! ease-in-out! duration-100! shrink-0 min-h-10 rounded-lg py-2 px-4 no-underline! hover:bg-[#404044] max-w-fit inline-flex cursor-pointer whitespace-nowrap textStyle_buttonMD'
                    href='https://graphical-playground.com/faq'
                  >
                    View FAQ
                  </Link>
                  <Link
                    className='relative justify-center items-center text-center transition-colors! ease-in-out! duration-100! shrink-0 min-h-10 rounded-lg py-2 px-4 no-underline! hover:bg-[#404044] max-w-fit inline-flex cursor-pointer whitespace-nowrap textStyle_buttonMD'
                    href='https://graphical-playground.com/licensing'
                  >
                    Licensing Terms
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='flex flex-col gap-6 w-full'>
          <h3 className='textStyle_headingLG text-white'>For Professionals & Enterprise</h3>
          <div className='flex flex-col md:flex-row w-full gap-4'>
            <div className='rounded-3xl flex-[1_1_0%] flex flex-col gap-4 relative bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.05)] p-8'>
              <div className='flex flex-col gap-4'>
                <div className='flex flex-row items-center gap-4'>
                  <h4 className='text-white textStyle_headingLG p-0! m-0!'>Pro Cloud Subscription</h4>
                </div>
                <span className='text-[rgba(255,255,255,0.65)] textStyle_paragraphMD'>
                  <p className='p-0! m-0!'>
                    If you're an active creator or small studio whose projects demand heavy lifting beyond your local
                    hardware, this plan unlocks our premium cloud infrastructure. For a flat monthly fee, you get
                    extended cloud computing hours, priority queueing, and expanded cloud storage. Because the core
                    engine is open-source, you{' '}
                    <strong className='text-white'>won't be required to pay royalties</strong> on your final product.
                  </p>
                </span>
              </div>
            </div>
            <div className='rounded-3xl flex-[1_1_0%] flex flex-col gap-4 relative bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.05)] p-8'>
              <div className='flex flex-col gap-4'>
                <div className='flex flex-row items-center gap-4'>
                  <h4 className='text-white textStyle_headingLG p-0! m-0!'>Enterprise (Seat-based)</h4>
                </div>
                <span className='text-[rgba(255,255,255,0.65)] textStyle_paragraphMD'>
                  <p className='p-0! m-0!'>
                    If you are operating a large studio needing dedicated cloud servers, custom pipeline integrations,
                    and guaranteed uptime,{' '}
                    <strong className='text-white'>a seat-based enterprise license is required</strong>. This provides
                    your team with unlimited, dynamically scalable cloud computing power, private secure data
                    processing, and direct technical support from the Graphical Playground team.
                  </p>
                </span>
              </div>
            </div>
          </div>
          <Link
            className='justify-center flex rounded-2xl p-8 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(48,48,52,0.7)] items-center no-underline! transition-background duration-300 ease-in-out'
            href='https://graphical-playground.com/licensing'
          >
            <div className='textStyle_paragraphMD text-white'>
              <div className='flex content-center flex-row items-center gap-1'>
                Read more
                <svg
                  aria-hidden='true'
                  className='w-5 h-5 fill-[rgba(255,255,255,0.95)]'
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  data-eds-icon='true'
                >
                  <path
                    fill-opacity='.95'
                    d='M12 2.25c5.385 0 9.75 4.365 9.75 9.75s-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12 6.615 2.25 12 2.25m1.03 5.72a.75.75 0 1 0-1.06 1.06l2.22 2.22H8a.75.75 0 0 0 0 1.5h6.19l-2.22 2.22a.75.75 0 1 0 1.06 1.06L17.06 12z'
                  ></path>
                </svg>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </Layout>
  );
}

import type { ReactNode } from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';

interface Volume {
  label: string;
  cover: string;
  buyUrl: string;
}

interface SingleBook {
  kind: 'single';
  title: string;
  authors: string[];
  description: string;
  cover: string;
  buyUrl: string;
  readFreeUrl?: string;
}

interface SeriesBook {
  kind: 'series';
  title: string;
  seriesSubtitle?: string;
  authors: string[];
  description: string;
  volumes: Volume[];
}

type BookEntry = SingleBook | SeriesBook;

interface Category {
  id: string;
  label: string;
  title: string;
  description: string;
  color: string;
  bgClass: string;
  books: BookEntry[];
}

const categories: Category[] = [
  {
    id: 'gpu-techniques',
    label: 'GPU Programming',
    title: 'GPU Programming',
    description:
      'From shader fundamentals to cutting-edge compute pipelines, these volumes collect the techniques that define what is possible on modern graphics hardware.',
    color: '#ECFF77',
    bgClass: 'bg-[#f5f5f0]',
    books: [
      {
        kind: 'series',
        title: 'GPU Pro',
        seriesSubtitle: 'Volumes 1–7',
        authors: ['Wolfgang Engel (ed.)'],
        description:
          'Seven volumes of curated GPU programming techniques assembled from leading graphics engineers across games and film. GPU Pro traces the evolution of real-time graphics from 2010 to 2016, covering everything from shadow algorithms and tessellation to global illumination and GPU-driven rendering.',
        volumes: [
          { label: 'Vol 1', cover: '/images/books/gpu-pro-1.jpg', buyUrl: 'https://www.amazon.com/dp/1568814720' },
          { label: 'Vol 2', cover: '/images/books/gpu-pro-2.jpg', buyUrl: 'https://www.amazon.com/dp/1568817185' },
          { label: 'Vol 3', cover: '/images/books/gpu-pro-3.jpg', buyUrl: 'https://www.amazon.com/dp/1439887829' },
          { label: 'Vol 4', cover: '/images/books/gpu-pro-4.jpg', buyUrl: 'https://www.amazon.com/dp/1466567430' },
          { label: 'Vol 5', cover: '/images/books/gpu-pro-5.jpg', buyUrl: 'https://www.amazon.com/dp/1482208636' },
          { label: 'Vol 6', cover: '/images/books/gpu-pro-6.jpg', buyUrl: 'https://www.amazon.com/dp/1482264617' },
          { label: 'Vol 7', cover: '/images/books/gpu-pro-7.jpg', buyUrl: 'https://www.amazon.com/dp/1498742537' },
        ],
      },
      {
        kind: 'series',
        title: 'GPU Zen',
        seriesSubtitle: 'Volumes 1–4',
        authors: ['Wolfgang Engel (ed.)'],
        description:
          'The natural follow-up to GPU Pro. Each GPU Zen volume gathers contributions from industry practitioners working at the frontier of GPU programming — advanced lighting models, hardware ray tracing, mesh shaders, and GPU-driven pipelines pushing what real-time hardware can deliver.',
        volumes: [
          { label: 'Vol 1', cover: '/images/books/gpu-zen-1.jpg', buyUrl: 'https://www.amazon.com/dp/0998822892' },
          { label: 'Vol 2', cover: '/images/books/gpu-zen-2.jpg', buyUrl: 'https://www.amazon.com/dp/179758314X' },
          { label: 'Vol 3', cover: '/images/books/gpu-zen-3.jpg', buyUrl: 'https://www.amazon.com/s?k=GPU+Zen+3+Wolfgang+Engel' },
          { label: 'Vol 4', cover: '/images/books/gpu-zen-4.jpg', buyUrl: 'https://www.amazon.com/dp/B0GNZJPVZ4' },
        ],
      },
      {
        kind: 'single',
        title: 'Real-Time Rendering',
        authors: ['Tomas Akenine-Möller', 'Eric Haines', 'Naty Hoffman'],
        description:
          'The comprehensive reference for real-time rendering algorithms. The fourth edition covers the complete rendering pipeline with expanded chapters on physically based shading, hardware ray tracing, and VR. A permanent fixture on every graphics programmer\'s desk — if you only read one book from this list, make it this one.',
        cover: '/images/books/real-time-rendering.jpg',
        buyUrl: 'https://www.amazon.com/dp/1138627003',
        readFreeUrl: 'https://www.realtimerendering.com/',
      },
    ],
  },
  {
    id: 'ray-tracing-pbr',
    label: 'Ray Tracing & PBR',
    title: 'Ray Tracing & Physically Based Rendering',
    description:
      'The theory and practice behind light transport simulation — from production path tracers to real-time hybrid rendering pipelines used in modern AAA titles.',
    color: '#EAD8FE',
    bgClass: 'bg-white bg-[radial-gradient(#00000020_1px,#ffffff_1px)] bg-size-[20px_20px]',
    books: [
      {
        kind: 'single',
        title: 'Physically Based Rendering: From Theory to Implementation',
        authors: ['Matt Pharr', 'Wenzel Jakob', 'Greg Humphreys'],
        description:
          'Sets the gold standard for photorealistic rendering by building a production-quality renderer from first principles. The fourth edition adds GPU rendering via OptiX and wavefront path tracing. The full text is freely available online — there is no excuse not to have read it.',
        cover: '/images/books/pbrt.jpg',
        buyUrl: 'https://www.amazon.com/dp/0262048027',
        readFreeUrl: 'https://pbrt.org/',
      },
      {
        kind: 'series',
        title: 'Ray Tracing Gems',
        seriesSubtitle: 'Volumes 1 & 2',
        authors: ['Eric Haines', 'Tomas Akenine-Möller', 'Adam Marrs', 'Peter Shirley', 'Ingo Wald'],
        description:
          'Practical knowledge on hardware-accelerated ray tracing, in the tradition of GPU Gems. Volume 1 covers the fundamentals of DXR and Vulkan RT; Volume 2 goes deeper into production applications across games, film, and scientific visualization. Both volumes are freely available online.',
        volumes: [
          { label: 'Vol 1', cover: '/images/books/ray-tracing-gems-1.jpg', buyUrl: 'https://www.amazon.com/dp/1484244265' },
          { label: 'Vol 2', cover: '/images/books/ray-tracing-gems-2.jpg', buyUrl: 'https://www.amazon.com/dp/1484271548' },
        ],
      },
    ],
  },
  {
    id: 'engine-architecture',
    label: 'Engine Architecture',
    title: 'Engine Architecture',
    description:
      'From scene graph design to asset pipeline management — the books that explain what goes on between the application layer and the GPU draw call.',
    color: '#CCFACC',
    bgClass: 'bg-[#f5f5f0]',
    books: [
      {
        kind: 'series',
        title: 'Game Engine Architecture',
        seriesSubtitle: '3rd & 4th Editions',
        authors: ['Jason Gregory'],
        description:
          'The most comprehensive guide to building a game engine available in print. Covers game loops, asset pipelines, audio, animation, physics, and rendering systems. The fourth edition, now spanning two volumes, is the most current treatment of modern engine internals in any published book.',
        volumes: [
          { label: '3rd Ed', cover: '/images/books/game-engine-architecture-3rd.jpg', buyUrl: 'https://www.amazon.com/dp/1138035459' },
          { label: '4th Ed', cover: '/images/books/game-engine-architecture-4th.jpg', buyUrl: 'https://www.amazon.com/dp/1032443082' },
        ],
      },
      {
        kind: 'series',
        title: 'Foundations of Game Engine Development',
        seriesSubtitle: 'Volumes 1 & 2',
        authors: ['Eric Lengyel'],
        description:
          'A dense, mathematically rigorous series covering the foundational theory behind modern game engines. Volume 1 tackles linear algebra, vector calculus, and 3D geometry. Volume 2 applies those foundations to rendering algorithms and GPU pipeline design. Written by the author of the Tombstone Engine and TERATHON math libraries.',
        volumes: [
          { label: 'Vol 1 · Math', cover: '/images/books/foundations-game-engine-dev-1.jpg', buyUrl: 'https://www.amazon.com/dp/0985811749' },
          { label: 'Vol 2 · Rendering', cover: '/images/books/foundations-game-engine-dev-2.jpg', buyUrl: 'https://www.amazon.com/dp/0985811757' },
        ],
      },
      {
        kind: 'single',
        title: 'Game Programming Patterns',
        authors: ['Robert Nystrom'],
        description:
          'A focused collection of design patterns specific to game development — Command, Observer, Component, Event Queue, Dirty Flag, and more. Clear examples and approachable writing make this one of the most readable books on the list. The full text is freely available online.',
        cover: '/images/books/game-programming-patterns.jpg',
        buyUrl: 'https://www.amazon.com/dp/0990582906',
        readFreeUrl: 'https://gameprogrammingpatterns.com/contents.html',
      },
      {
        kind: 'single',
        title: '3D Game Engine Design',
        authors: ['David H. Eberly'],
        description:
          'Covers the geometric and algorithmic foundations of a 3D game engine: scene graph management, spatial partitioning, level-of-detail systems, shader design, and skeletal animation. Written alongside the open-source Wild Magic engine, so every concept has a reference implementation.',
        cover: '/images/books/3d-game-engine-design.jpg',
        buyUrl: 'https://www.amazon.com/dp/0122290631',
      },
    ],
  },
  {
    id: 'physics',
    label: 'Physics & Collision',
    title: 'Physics & Collision',
    description:
      'The math and algorithms behind the forces, constraints, and geometry queries that make virtual worlds respond like physical ones.',
    color: '#bde2f8',
    bgClass: 'bg-white bg-[radial-gradient(#00000020_1px,#ffffff_1px)] bg-size-[20px_20px]',
    books: [
      {
        kind: 'single',
        title: 'Real-Time Collision Detection',
        authors: ['Christer Ericson'],
        description:
          'The authoritative reference on collision detection for interactive applications. Ericson covers bounding volume hierarchies, GJK, SAT, continuous collision detection, and broad-phase spatial data structures with the depth and rigor you need to implement them correctly. Every physics programmer keeps a copy within arm\'s reach.',
        cover: '/images/books/real-time-collision-detection.jpg',
        buyUrl: 'https://www.amazon.com/dp/1558607323',
      },
      {
        kind: 'single',
        title: 'Game Physics Engine Development',
        authors: ['Ian Millington'],
        description:
          'A practical guide to building a physics engine from scratch. Millington walks through particle physics, rigid body dynamics, contact resolution, and collision detection with readable, step-by-step code. A great complement to Ericson\'s more theoretical coverage of collision geometry.',
        cover: '/images/books/game-physics-engine-development.jpg',
        buyUrl: 'https://www.amazon.com/dp/0123819768',
      },
    ],
  },
];

function ArrowIcon() {
  return (
    <svg className='w-4 h-4' viewBox='0 0 24 24' fill='currentColor'>
      <path d='M12 2.25c5.385 0 9.75 4.365 9.75 9.75s-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12 6.615 2.25 12 2.25m1.03 5.72a.75.75 0 1 0-1.06 1.06l2.22 2.22H8a.75.75 0 0 0 0 1.5h6.19l-2.22 2.22a.75.75 0 1 0 1.06 1.06L17.06 12z' />
    </svg>
  );
}

function SingleBookCard({ book, accentColor }: { book: SingleBook; accentColor: string }) {
  return (
    <div className='group flex flex-col rounded-2xl overflow-hidden bg-white border border-black/10 hover:border-black/20 hover:shadow-md transition-all duration-200'>
      <div className='relative overflow-hidden bg-black/5' style={{ aspectRatio: '2/3' }}>
        <img
          src={book.cover}
          alt={`${book.title} cover`}
          className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]'
        />
      </div>
      <div className='flex flex-col flex-1 p-6'>
        <h3 className='text-lg font-normal tracking-tight text-black leading-snug'>{book.title}</h3>
        <p className='text-black/45 text-sm mt-1.5'>{book.authors.join(', ')}</p>
        <p className='text-black/60 text-sm mt-3 leading-relaxed flex-1'>{book.description}</p>
        <div className='mt-5 flex items-center gap-3 flex-wrap'>
          <Link
            href={book.buyUrl}
            className='inline-flex items-center gap-1.5 text-sm font-medium bg-black text-white px-4 py-2 rounded-xl no-underline hover:bg-black/80 active:bg-black/70 transition-colors duration-150'
          >
            Get this book
            <ArrowIcon />
          </Link>
          {book.readFreeUrl && (
            <Link
              href={book.readFreeUrl}
              className='inline-flex items-center gap-1 text-sm text-black/50 no-underline hover:text-black transition-colors duration-150'
            >
              Read free →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function SmallSeriesCard({ book, accentColor }: { book: SeriesBook; accentColor: string }) {
  return (
    <div className='flex flex-col rounded-2xl overflow-hidden bg-white border border-black/10 hover:border-black/20 hover:shadow-md transition-all duration-200'>
      <div className='flex gap-2 p-4' style={{ backgroundColor: accentColor }}>
        {book.volumes.map((vol) => (
          <div
            key={vol.label}
            className='flex-1 rounded-xl overflow-hidden shadow-sm'
            style={{ aspectRatio: '2/3' }}
          >
            <img src={vol.cover} alt={vol.label} className='w-full h-full object-cover' />
          </div>
        ))}
      </div>
      <div className='flex flex-col flex-1 p-6'>
        <div>
          <h3 className='text-lg font-normal tracking-tight text-black leading-snug'>{book.title}</h3>
          {book.seriesSubtitle && (
            <p className='text-black/40 text-xs mt-0.5 uppercase tracking-wider'>{book.seriesSubtitle}</p>
          )}
        </div>
        <p className='text-black/45 text-sm mt-1.5'>{book.authors.join(', ')}</p>
        <p className='text-black/60 text-sm mt-3 leading-relaxed flex-1'>{book.description}</p>
        <div className='mt-5 flex flex-wrap gap-2'>
          {book.volumes.map((vol) => (
            <Link
              key={vol.label}
              href={vol.buyUrl}
              className='inline-flex items-center text-xs font-medium border border-black/15 text-black px-3 py-1.5 rounded-full no-underline hover:bg-black hover:text-white hover:border-black transition-all duration-150'
            >
              {vol.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function FeaturedSeriesCard({ book, accentColor }: { book: SeriesBook; accentColor: string }) {
  return (
    <div className='col-span-full rounded-2xl overflow-hidden border border-black/10 hover:border-black/20 hover:shadow-md transition-all duration-200 flex flex-col md:flex-row'>
      <div
        className='p-6 md:p-8 flex gap-3 overflow-x-auto md:w-[55%] lg:w-[60%] flex-shrink-0'
        style={{ backgroundColor: accentColor }}
      >
        {book.volumes.map((vol) => (
          <Link
            href={vol.buyUrl}
            key={vol.label}
            className='flex-shrink-0 flex flex-col items-center gap-1.5 no-underline group/vol'
            style={{ width: '72px' }}
          >
            <div className='rounded-xl overflow-hidden shadow-sm w-full transition-transform duration-200 group-hover/vol:scale-105' style={{ aspectRatio: '2/3' }}>
              <img src={vol.cover} alt={vol.label} className='w-full h-full object-cover' />
            </div>
            <span className='text-xs text-black/55 group-hover/vol:text-black transition-colors'>{vol.label}</span>
          </Link>
        ))}
      </div>
      <div className='p-6 md:p-8 bg-white flex flex-col justify-between flex-1'>
        <div>
          <h3 className='text-2xl font-normal tracking-tight text-black leading-snug'>{book.title}</h3>
          {book.seriesSubtitle && (
            <p className='text-black/40 text-xs mt-1 uppercase tracking-wider'>{book.seriesSubtitle}</p>
          )}
          <p className='text-black/45 text-sm mt-2'>{book.authors.join(', ')}</p>
          <p className='text-black/60 text-sm mt-4 leading-relaxed'>{book.description}</p>
        </div>
        <div className='mt-6 flex flex-wrap gap-2'>
          {book.volumes.map((vol) => (
            <Link
              key={vol.label}
              href={vol.buyUrl}
              className='inline-flex items-center text-xs font-medium border border-black/15 text-black px-3 py-1.5 rounded-full no-underline hover:bg-black hover:text-white hover:border-black transition-all duration-150'
            >
              {vol.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function BookCard({ book, accentColor }: { book: BookEntry; accentColor: string }) {
  if (book.kind === 'single') {
    return <SingleBookCard book={book} accentColor={accentColor} />;
  }
  if (book.volumes.length > 3) {
    return <FeaturedSeriesCard book={book} accentColor={accentColor} />;
  }
  return <SmallSeriesCard book={book} accentColor={accentColor} />;
}

export default function RecommendedReadings(): ReactNode {
  return (
    <Layout
      title='Recommended Readings'
      description='Books the Graphical Playground team read to understand real-time rendering, game engine architecture, and GPU programming at a deep level.'
    >
      {/* Hero */}
      <div className='bg-white bg-[radial-gradient(#00000020_1px,#ffffff_1px)] bg-size-[20px_20px] px-4 md:px-6 pt-24 md:pt-32 pb-16 md:pb-24'>
        <div className='container mx-auto'>
          <p className='text-black/40 text-xs font-medium tracking-widest uppercase mb-4'>Library</p>
          <h1 className='max-w-3xl text-4xl sm:text-5xl md:text-[64px] font-normal leading-tight tracking-[-0.02em] text-black'>
            Required{' '}
            <span className='relative inline-block whitespace-nowrap'>
              <span className='absolute -left-1 bottom-1 -z-10 h-[60%] w-[105%] -rotate-1 rounded-md bg-[#ECFF77]'></span>
              Reading
            </span>
          </h1>
          <p className='mt-6 md:mt-8 max-w-xl text-base md:text-lg text-black/60 leading-relaxed'>
            The books that shaped how we think about real-time graphics, GPU programming, and game engine design.
            If you want to understand why Graphical Playground works the way it does, start here.
          </p>
        </div>
      </div>

      {/* Category sections */}
      {categories.map((cat) => (
        <section key={cat.id} className={`${cat.bgClass} text-black py-16 md:py-24`}>
          <div className='container mx-auto px-4 md:px-6'>
            {/* Section header */}
            <div className='mb-10 md:mb-14'>
              <span
                className='inline-block text-xs font-medium tracking-widest uppercase px-3 py-1.5 rounded-full mb-4'
                style={{ backgroundColor: cat.color }}
              >
                {cat.label}
              </span>
              <h2 className='text-3xl md:text-4xl lg:text-5xl font-normal tracking-tight text-black leading-tight'>
                {cat.title}
              </h2>
              <p className='mt-3 max-w-2xl text-black/55 text-base md:text-lg leading-relaxed'>
                {cat.description}
              </p>
            </div>

            {/* Books grid */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
              {cat.books.map((book) => (
                <BookCard key={book.title} book={book} accentColor={cat.color} />
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Footer CTA */}
      <div className='bg-[#f5f5f0] text-black py-16 md:py-24'>
        <div className='container mx-auto px-4 md:px-6 text-center'>
          <h2 className='text-3xl md:text-4xl font-normal tracking-tight text-black'>
            Ready to build?
          </h2>
          <p className='mt-4 max-w-md mx-auto text-black/55 text-base md:text-lg leading-relaxed'>
            Put theory into practice with Graphical Playground — an open-source graphics engine built on the same principles these books teach.
          </p>
          <div className='mt-8 flex flex-col sm:flex-row items-center justify-center gap-3'>
            <Link
              href='/docs/guides'
              className='w-full sm:w-auto text-center bg-[#ECFF77] border border-[#ECFF77] rounded-xl px-8 py-3 text-black font-medium no-underline hover:bg-[#d9ec5e] active:bg-[#c8db4f] transition-all duration-150'
            >
              Explore the Guides
            </Link>
            <Link
              href='/docs/gp-engine/Introduction'
              className='w-full sm:w-auto text-center bg-transparent border border-black rounded-xl px-8 py-3 text-black font-medium no-underline hover:bg-black hover:text-white active:bg-gray-800 transition-all duration-150'
            >
              Read the API Reference
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}

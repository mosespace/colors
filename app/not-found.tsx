import Link from 'next/link';
import Image from 'next/image';
import { siteConfig } from '@/constants/site';

export default function NotFound() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* Background Image */}
      <Image
        // src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-VHLApPIadgIMFXeRxWBINU68LiN4tI.png"
        src="https://images.pexels.com/photos/3163994/pexels-photo-3163994.jpeg?auto=compress&cs=tinysrgb&w=600"
        alt="Foggy forest landscape"
        fill
        className="object-cover object-center brightness-50 grayscale"
        priority
      />

      {/* Content Overlay */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 text-center text-white">
        <div className="max-w-2xl space-y-6">
          <h2 className="text-xl font-medium tracking-wide text-white/90">
            FOG ERROR
          </h2>

          <h1 className="text-[10rem] font-bold leading-none tracking-tighter text-white/80 sm:text-[12rem]">
            404
          </h1>

          <div className="space-y-4">
            <h3 className="text-2xl font-semibold">Page not found</h3>

            <p className="text-sm text-white/70">
              I tried to catch some fog, but I missed it
            </p>
          </div>

          <Link
            href="/"
            className="inline-block rounded-md border border-white/20 px-6 py-2 text-sm 
                     transition-colors hover:bg-white/10"
          >
            Back to Home
          </Link>

          <div className="pt-16 text-xs text-white/50">
            © {new Date().getFullYear()} {siteConfig.name} error. All rights
            reserved
          </div>
        </div>
      </div>
    </div>
  );
}

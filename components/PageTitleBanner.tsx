import React from 'react';

function BgStipes() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[2px] items-start left-[2px] right-[2px] top-[calc(50%-1px)] translate-y-[-50%]" data-name="Bg stipes">
      <div className="bg-black h-[2px] shrink-0 w-full" />
      <div className="bg-black h-[2px] shrink-0 w-full" />
      <div className="bg-black h-[2px] shrink-0 w-full" />
      <div className="bg-black h-[2px] shrink-0 w-full" />
      <div className="bg-black h-[2px] shrink-0 w-full" />
      <div className="bg-black h-[2px] shrink-0 w-full" />
    </div>
  );
}

interface PageTitleBannerProps {
  title: string;
}

export function PageTitleBanner({ title }: PageTitleBannerProps) {
  return (
    <div className="bg-white relative w-full h-20" data-name="Page title">
      <div className="relative size-full">
        <BgStipes />
        <div className="absolute bg-white box-border content-stretch flex gap-[10px] items-center justify-center left-[calc(50%+0.5px)] px-[14px] py-0 top-[calc(50%-16px)] translate-x-[-50%]">
          <p className="font-['VT323',_sans-serif] leading-[32px] not-italic relative shrink-0 text-[56px] text-black text-center text-nowrap whitespace-pre">
            {title}
          </p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0px_0px_2px] border-black border-solid inset-0 pointer-events-none" />
    </div>
  );
}

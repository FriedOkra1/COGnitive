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

function Frame2() {
  return (
    <div className="absolute bg-white box-border content-stretch flex gap-[10px] items-center justify-center left-[calc(50%+0.5px)] pl-[14px] pr-[10px] py-0 top-[5px] translate-x-[-50%]">
      <p className="font-['ChiKareGo2:Medium',_sans-serif] leading-[24px] not-italic relative shrink-0 text-[32px] text-black text-center text-nowrap whitespace-pre">Welcome</p>
    </div>
  );
}

export default function PageTitle() {
  return (
    <div className="bg-white relative size-full" data-name="Page title">
      <div className="relative size-full">
        <BgStipes />
        <Frame2 />
      </div>
      <div aria-hidden="true" className="absolute border-[0px_0px_2px] border-black border-solid inset-0 pointer-events-none" />
    </div>
  );
}
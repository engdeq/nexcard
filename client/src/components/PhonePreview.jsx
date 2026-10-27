import { DigitalCard } from './DigitalCard';

export function PhonePreview({
  profile,
  className = '',
  compact = false,
}) {
  return (
    <div
      className={`mx-auto w-full ${compact ? 'max-w-[240px]' : 'max-w-[300px]'} ${className}`}
    >
      <div className="rounded-[1.85rem] border-[7px] border-[#172033] bg-[#172033] p-1 shadow-xl">
        <div className="max-h-[560px] overflow-y-auto overflow-x-hidden rounded-[1.4rem] bg-white">
          <DigitalCard
            profile={profile}
            interactive={false}
            showBrand
            showUrlBar={!!profile.slug}
          />
        </div>
      </div>
      {!compact && (
        <p className="mt-2 text-center text-[11px] text-muted">
          Live mobile preview
        </p>
      )}
    </div>
  );
}

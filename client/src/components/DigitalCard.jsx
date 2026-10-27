import {
  Globe,
  Mail,
  MapPin,
  Phone,
  UserPlus,
  UserRound,
} from 'lucide-react';
import { assetUrl } from '../services/api';
import { LogoMark } from './Logo';
import {
  SocialBrandIcon,
  detectPlatformFromUrl,
  socialBrandColor,
} from './SocialIcons';

function QuickAction({ icon: Icon, href, label, accent, interactive }) {
  const className =
    'flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F0F2F8] transition hover:bg-[#E4E8F3]';
  const style = { color: accent };
  if (interactive && href) {
    return (
      <a
        href={href}
        target={href.startsWith('http') ? '_blank' : undefined}
        rel={href.startsWith('http') ? 'noreferrer' : undefined}
        aria-label={label}
        className={className}
        style={style}
      >
        <Icon size={18} />
      </a>
    );
  }
  return (
    <span className={className} style={style} title={label}>
      <Icon size={18} />
    </span>
  );
}

/**
 * Flat digital business card — no accordion dropdowns.
 * Used for live phone preview and public profile.
 */
export function DigitalCard({
  profile,
  interactive = false,
  onAddContact,
  showBrand = true,
  showUrlBar = false,
  className = '',
}) {
  const photo = assetUrl(profile.profilePhoto);
  const cover = assetUrl(profile.coverImage);
  const logo = assetUrl(profile.companyLogo);
  const accent = profile.accentColor || '#7657F6';
  const buttonStyle = profile.buttonStyle || 'solid';
  const socials = (profile.socialLinks || []).filter((s) => s.url?.trim());

  const ctaClass =
    buttonStyle === 'outline'
      ? 'border-2 bg-transparent'
      : buttonStyle === 'rounded'
        ? 'rounded-full'
        : 'rounded-2xl';

  const ctaStyle =
    buttonStyle === 'outline'
      ? { borderColor: accent, color: accent, backgroundColor: 'transparent' }
      : { backgroundColor: accent, color: '#fff' };

  return (
    <div className={`overflow-hidden bg-white ${className}`}>
      <div
        className="relative px-4 pb-14 pt-4"
        style={{
          background: cover
            ? undefined
            : `linear-gradient(160deg, ${accent} 0%, #9B7CFF 55%, #C4B5FD 100%)`,
          minHeight: 140,
        }}
      >
        {cover && (
          <>
            <img
              src={cover}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40" />
          </>
        )}

        {showBrand && (
          <div className="relative z-[1] mb-4 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <LogoMark size={20} />
              <span className="text-xs font-bold text-white">NexaCard</span>
            </div>
            {logo && (
              <img
                src={logo}
                alt="Company logo"
                className="h-7 w-7 rounded-lg border border-white/40 bg-white object-contain"
              />
            )}
          </div>
        )}

        <div className="relative z-[1] flex justify-center">
          <div className="h-[88px] w-[88px] overflow-hidden rounded-full border-[4px] border-white bg-white shadow-lg">
            {photo ? (
              <img
                src={photo}
                alt={profile.fullName || 'Profile'}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-[#F0F2F8] text-[#69758C]">
                <UserRound size={36} strokeWidth={1.4} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="-mt-2 space-y-3.5 px-4 pb-4 pt-1">
        <div className="text-center">
          <h2 className="font-display text-lg font-bold text-[#172033]">
            {profile.fullName || 'Your Name'}
          </h2>
          <p className="mt-0.5 text-[13px] text-[#69758C]">
            {[profile.jobTitle, profile.company].filter(Boolean).join(' · ') ||
              'Job title · Company'}
          </p>
        </div>

        <div className="flex items-center justify-center gap-2.5">
          {(profile.phone || !interactive) && (
            <QuickAction
              icon={Phone}
              label="Call"
              accent={accent}
              href={interactive && profile.phone ? `tel:${profile.phone}` : undefined}
              interactive={interactive && !!profile.phone}
            />
          )}
          {(profile.email || !interactive) && (
            <QuickAction
              icon={Mail}
              label="Email"
              accent={accent}
              href={
                interactive && profile.email ? `mailto:${profile.email}` : undefined
              }
              interactive={interactive && !!profile.email}
            />
          )}
          {(profile.website || !interactive) && (
            <QuickAction
              icon={Globe}
              label="Website"
              accent={accent}
              href={interactive && profile.website ? profile.website : undefined}
              interactive={interactive && !!profile.website}
            />
          )}
          {(profile.address || !interactive) && (
            <QuickAction
              icon={MapPin}
              label="Location"
              accent={accent}
              href={
                interactive && profile.address
                  ? `https://maps.google.com/?q=${encodeURIComponent(profile.address)}`
                  : undefined
              }
              interactive={interactive && !!profile.address}
            />
          )}
        </div>

        {interactive && onAddContact ? (
          <button
            type="button"
            onClick={onAddContact}
            className={`flex w-full items-center justify-center gap-2 py-3 text-sm font-bold shadow-sm transition hover:opacity-95 ${
              buttonStyle === 'rounded' ? 'rounded-full' : 'rounded-2xl'
            } ${buttonStyle === 'outline' ? 'border-2' : ''}`}
            style={ctaStyle}
          >
            <UserPlus size={16} />
            Add to Contacts
          </button>
        ) : (
          <div
            className={`flex w-full items-center justify-center gap-2 py-3 text-sm font-bold ${ctaClass}`}
            style={ctaStyle}
          >
            <UserPlus size={16} />
            Add to Contacts
          </div>
        )}

        {/* About — always visible, no accordion */}
        <div className="rounded-2xl border border-[#E6EAF2] bg-[#F8F9FC] px-3.5 py-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#69758C]">
            About Me
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-[#172033]">
            {profile.bio || 'Add a short biography to introduce yourself.'}
          </p>
        </div>

        {profile.company && (
          <div className="rounded-2xl border border-[#E6EAF2] bg-[#F8F9FC] px-3.5 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-[#69758C]">
              Company
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              {logo && (
                <img
                  src={logo}
                  alt=""
                  className="h-8 w-8 rounded-lg border border-[#E6EAF2] object-contain"
                />
              )}
              <div>
                <p className="text-sm font-semibold text-[#172033]">
                  {profile.company}
                </p>
                {profile.jobTitle && (
                  <p className="text-xs text-[#69758C]">{profile.jobTitle}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Services as pills */}
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-[#69758C]">
            Our Services
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(profile.jobTitle
              ? [profile.jobTitle, profile.company].filter(Boolean)
              : ['Digital Profile', 'QR Sharing']
            ).map((tag) => (
              <span
                key={tag}
                className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                style={{ backgroundColor: `${accent}14`, color: accent }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Social — always visible brand icons */}
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-[#69758C]">
            Connect With Me
          </p>
          {socials.length === 0 ? (
            <p className="text-xs text-[#69758C]">
              Add social links in the editor to show them here.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {socials.map((s, i) => {
                const platform =
                  s.platform && s.platform !== 'Other' && s.platform !== 'Custom URL'
                    ? s.platform
                    : detectPlatformFromUrl(s.url);
                const color = socialBrandColor(platform);
                const icon = (
                  <span
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E6EAF2] bg-white shadow-sm transition hover:scale-105"
                    style={{ color }}
                    title={platform}
                  >
                    <SocialBrandIcon platform={platform} size={17} />
                  </span>
                );
                return interactive ? (
                  <a
                    key={`${platform}-${i}`}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={platform}
                  >
                    {icon}
                  </a>
                ) : (
                  <span key={`${platform}-${i}`}>{icon}</span>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showUrlBar && profile.slug && (
        <div className="border-t border-[#E6EAF2] bg-[#F8F9FC] px-3 py-2 text-center text-[10px] text-[#69758C]">
          /p/{profile.slug}
        </div>
      )}
    </div>
  );
}

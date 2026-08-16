import { QRCodeSVG } from 'qrcode.react';
import { useInvite } from '~/hooks/useInvite';
import { useVenueSlug } from '~/hooks/useVenueSlug';

export const VenueQrCode = () => {
  const slug = useVenueSlug();
  const { data: invite } = useInvite(slug);

  if (!invite || typeof window === 'undefined') return null;

  const joinUrl = `${window.location.origin}/join/${invite.token}`;

  return (
    <div className="flex shrink-0 flex-col items-center gap-2 rounded-xl bg-white p-3">
      <QRCodeSVG value={joinUrl} size={152} />
      <p className="text-center text-xs font-medium text-black">
        Escanea para pedir canciones
      </p>
    </div>
  );
};

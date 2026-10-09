import { useNotification } from "../store/notification";

/* A mailto: link only does something if the visitor has a mail app set up, which many
   desktop browsers don't. So the click also copies the address and says so: there is
   always a visible result, and the mail app still opens for those who have one. */
export default function EmailLink({ email, subject, className = "", children }) {
  const { notify } = useNotification();
  const href = `mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;

  const onClick = () => {
    const copied = () => notify.success({
      kicker: "EMAIL ADDRESS COPIED",
      title: email,
      message: "Paste it into your email, or use the contact form and we will reply within 4 business hours.",
      icon: "mail",
      action: { label: "Contact form", url: "/contact" },
      sound: false,
    });
    try {
      navigator.clipboard?.writeText(email).then(copied, () => {});
    } catch { /* clipboard blocked: the mailto link still fires */ }
  };

  return (
    <a href={href} onClick={onClick} className={className}>
      {children || email}
    </a>
  );
}

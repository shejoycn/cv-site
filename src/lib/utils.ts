export function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(" ");
}

export function formatMailto(email: string) {
  return `mailto:${email}`;
}

import SiteNavbar from "@/components/global/SiteNavbar";
import Wordmark from "@/components/global/Wordmark";
import ExternalLink from "@/components/ui/external-link";
import MaxWidthWrapper from "@/components/ui/MaxWidthWrapper";

type Props = {
  readonly children: React.ReactNode;
};

function SiteLayout({ children }: Props) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteNavbar />
      <div className="flex-1 pt-16">{children}</div>
      <footer className="mt-10 border-t border-border py-6">
        <MaxWidthWrapper className="flex flex-col items-center justify-between gap-3 font-mono text-[11px] text-muted-foreground sm:flex-row">
          <Wordmark className="[&>span:last-child]:font-normal [&>span:last-child]:text-muted-foreground" />
          <ExternalLink
            className="transition-colors hover:text-brand"
            href="https://github.com/kapeka0/ctf-archives-frontend"
            rel="noopener noreferrer"
            target="_blank"
          >
            source
          </ExternalLink>
        </MaxWidthWrapper>
      </footer>
    </div>
  );
}

export default SiteLayout;

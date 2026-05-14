export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-6 py-10 text-center text-sm text-muted-foreground sm:flex-row sm:justify-between sm:text-left">
        <p>
          <span className="font-semibold text-foreground">regalito</span> —
          regalos de cumpleaños en Argentina.
        </p>
        <p>Hecho por la comunidad. Los datos pueden cambiar, verificá siempre.</p>
      </div>
    </footer>
  );
}

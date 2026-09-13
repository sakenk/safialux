import SiteLayout from "./(site)/layout";
import Link from "next/link";

export default function NotFound() {
  return (
    <SiteLayout>
    <div className="container-x flex min-h-[60vh] flex-col items-center justify-center gap-5 py-16 text-center">
      <div className="dim w-64"><span>404</span></div>
      <h1 className="text-3xl font-semibold">Страница не найдена</h1>
      <p className="max-w-md text-ink-soft">Возможно, товар сняли с продажи или ссылка устарела. Найдите нужное в каталоге или позвоните нам.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/catalog" className="btn btn-primary">Открыть каталог</Link>
        <Link href="/" className="btn btn-ghost">На главную</Link>
      </div>
    </div>
    </SiteLayout>
  );
}

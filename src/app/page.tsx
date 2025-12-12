import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GalleryVerticalEnd, FileText, Users, BarChart3, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-5" />
            </div>
            OneTest
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/signin">Войти</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Регистрация</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto py-20" style={{ paddingLeft: '45px', paddingRight: '45px' }}>
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl">
              Создавайте формы и тесты
              <br />
              <span className="text-primary">легко и быстро</span>
            </h1>
            <p className="mb-8 text-xl text-muted-foreground">
              OneTest — это современная платформа для создания форм, опросов и тестов.
              Собирайте ответы, анализируйте результаты и делитесь формами с коллегами.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild>
                <Link href="/signup">Начать бесплатно</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/signin">Войти в аккаунт</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-t bg-muted/50 py-20">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold">
              Возможности платформы
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader>
                  <FileText className="mb-2 h-8 w-8 text-primary" />
                  <CardTitle>Разнообразные типы вопросов</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Одиночный выбор, множественный выбор, текстовые поля и многое другое
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Users className="mb-2 h-8 w-8 text-primary" />
                  <CardTitle>Управление доступом</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Настраивайте права доступа для редакторов, читателей и участников
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <BarChart3 className="mb-2 h-8 w-8 text-primary" />
                  <CardTitle>Аналитика результатов</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Просматривайте и анализируйте все ответы в удобном формате
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Shield className="mb-2 h-8 w-8 text-primary" />
                  <CardTitle>Публичные и приватные формы</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Делайте формы публичными или ограничивайте доступ только для выбранных пользователей
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold">Готовы начать?</h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Создайте аккаунт и начните создавать свои первые формы уже сегодня
            </p>
            <Button size="lg" asChild>
              <Link href="/signup">Зарегистрироваться</Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Made with ❤️ by <a href="https://github.com/tixomirkin" className="underline hover:text-foreground">@tixomirkin</a></p>
        </div>
      </footer>
    </div>
  );
}

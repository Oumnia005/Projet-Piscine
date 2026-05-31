"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/auth-context"
import { saveContactMessage } from "@/lib/vitacare-store"
import { toast } from "sonner"

export default function ContactPage() {
  const { user } = useAuth()
  const [form, setForm] = useState({
    name: user ? `${user.first_name} ${user.last_name}` : "",
    email: user?.email || "",
    subject: "",
    message: "",
  })

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    saveContactMessage({
      name: form.name,
      email: form.email,
      subject: form.subject,
      message: form.message,
      userId: user?.id,
      userRole: user?.role,
    })
    setForm({ name: user ? `${user.first_name} ${user.last_name}` : "", email: user?.email || "", subject: "", message: "" })
    toast.success("Message envoye a l'administrateur")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-16 bg-muted/20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4">Contactez-nous</h1>
            <p className="text-muted-foreground text-lg">Votre message sera transmis a l'administrateur VitaCare.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-semibold mb-2">VitaCare Paris</h2>
                <p className="text-muted-foreground">25 Avenue du Bien-etre<br />75008 Paris</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Telephone</h3>
                <p className="text-muted-foreground">+33 1 45 67 89 10</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Email</h3>
                <p className="text-muted-foreground">contact@vitacare.fr</p>
              </div>
              {user && (
                <div className="rounded-lg border bg-background p-4">
                  <h3 className="font-semibold">Informations jointes au message</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {user.first_name} {user.last_name} · {user.email} · role: {user.role}
                  </p>
                </div>
              )}
            </div>

            <form onSubmit={submit} className="bg-background p-8 rounded-2xl shadow-lg space-y-4">
              <Input placeholder="Votre nom" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
              <Input type="email" placeholder="Votre email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
              <Input placeholder="Sujet" value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} required />
              <Textarea placeholder="Votre message..." className="min-h-[180px]" value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} required />
              <Button className="w-full">Envoyer le message</Button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

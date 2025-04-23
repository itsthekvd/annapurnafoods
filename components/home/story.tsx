import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Story() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <h2 className="text-3xl font-bold text-amber-800 mb-6">My Story</h2>
            <p className="text-gray-600 mb-4">Namaskaram!</p>
            <p className="text-gray-600 mb-4">
              Myself Harshada. I am an Isha Meditator and a Sadhanapada alumni. Staying out of the yoga center has made
              me crave Isha food a lot.
            </p>
            <p className="text-gray-600 mb-4">
              So I thought, there might be many meditators like me who would want Sattvik homemade food delivered.
            </p>
            <p className="text-gray-600 mb-6">
              And that is why I started delivering food near Isha Yoga Center Coimbatore.
            </p>
            <Link href="/menu">
              <Button className="bg-amber-700 hover:bg-amber-800">Check Our Menu</Button>
            </Link>
          </div>
          <div className="relative h-[300px] md:h-[400px] rounded-lg overflow-hidden shadow-xl order-1 md:order-2">
            <Image
              src="https://ucarecdn.com/473c804e-b963-41e9-b23f-e62ed15a690c/harshadadeshpandephoto.jpeg"
              alt="Harshada Deshpande - Annapurna Foods"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}

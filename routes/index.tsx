// ./routes/index.tsx

import ListPages from "../components/listPages.tsx";

export default function Home() {
  return (
    <div class="px-4 py-8 mx-auto bg-[#86efac]">
      <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
        {/* logo: https://emojirepo.org/emoji/bar_chart */}
        <img
          class="my-6"
          src="/logo.svg"
          width="128"
          height="128"
          alt="the Fresh logo: a sliced lemon dripping with juice"
        />
        <h1 class="text-4xl font-bold">Sensor data analyzer</h1>
        <p class="my-4">Check out our current tools:</p>
        <ListPages />
        <p class="my-4">
          Page in development ⚙️. - 13.04.2025
        </p>
      </div>
    </div>
  );
}

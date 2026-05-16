const frases = [
  "Seu corpo conta histórias. Aprenda a ouvi-lo.",
  "Cuidar de você é o primeiro passo para cuidar de todos.",
  "Conhecimento é a melhor forma de cuidado.",
  "Cada ciclo é único. O seu também é.",
];

const SplashScreen = () => {
  const frase = frases[Math.floor(Date.now() / 86400000) % frases.length];

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-[#FBF4EB]">
      <div className="flex flex-col items-center gap-6 px-8 text-center">
        <div className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg bg-[#C43A4A]">
          <span className="text-5xl">🌺</span>
        </div>

        <div>
          <h1 className="text-4xl font-bold tracking-tight text-[#C43A4A]">
            MS Feminina
          </h1>
          <p className="text-sm mt-1 text-[#C56682]">
            Minha Saúde Feminina
          </p>
        </div>

        <p className="text-base leading-relaxed max-w-xs text-[#6b5a5e]">
          {frase}
        </p>

        <div className="flex gap-2 mt-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full animate-pulse bg-[#C43A4A]"
              style={{ animationDelay: `${i * 200}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;

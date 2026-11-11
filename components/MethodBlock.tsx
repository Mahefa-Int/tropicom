import DimensionalField from "@/components/ui/dimensional-field";
import Method from "@/components/Method";
import Steps from "@/components/Steps";

/** Bloc « méthode » : en-tête + 5 temps, sur un fond animé commun (Dimensional Field, charte Tropi'Com). */
export default function MethodBlock() {
  return (
    <div className="method-block">
      {/* fond discret, sans grille, dans les tons bleu canard (comme la bande de la maquette des 5 temps) */}
      <DimensionalField className="method-field" intensity={0.7} grid={false} color1="#3e9d9e" color2="#1b4f5c" />
      <Method />
      <Steps />
    </div>
  );
}

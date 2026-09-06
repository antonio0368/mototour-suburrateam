function formattaKm(metri) {
  if (!Number.isFinite(metri)) {
    return "Dati non disponibili";
  }

  return `${(metri / 1000).toLocaleString("it-IT", {
    maximumFractionDigits: 1,
  })} km`;
}

function formattaDurata(secondi) {
  if (!Number.isFinite(secondi)) {
    return "Dati non disponibili";
  }

  const ore = Math.floor(secondi / 3600);
  const minuti = Math.round((secondi % 3600) / 60);

  return `${ore} h ${minuti.toString().padStart(2, "0")} min`;
}

function formattaQuota(valore, prefisso = "") {
  if (!Number.isFinite(valore)) {
    return "Dati non disponibili";
  }

  return `${prefisso}${Math.round(valore).toLocaleString("it-IT")} m`;
}

export default function RiepilogoPercorso({
  riepilogo,
  titolo = "Anteprima percorso",
}) {
  if (!riepilogo) {
    return (
      <section className="riepilogo-percorso riepilogo-vuoto">
        <h3>{titolo}</h3>
        <p>Calcola il percorso per visualizzare i dati.</p>
      </section>
    );
  }

  return (
    <section className="riepilogo-percorso">
      <div className="riepilogo-intestazione">
        <h3>{titolo}</h3>
        <span>Dati calcolati dalla traccia</span>
      </div>

      <div className="riepilogo-griglia">
        <article>
          <span>Chilometri</span>
          <strong>
            {formattaKm(riepilogo.distanzaMetri)}
          </strong>
        </article>

        <article>
          <span>Tempo stimato</span>
          <strong>
            {formattaDurata(riepilogo.durataSecondi)}
          </strong>
        </article>

        <article>
          <span>Dislivello positivo</span>
          <strong>
            {formattaQuota(
              riepilogo.dislivelloPositivo,
              "+"
            )}
          </strong>
        </article>

        <article>
          <span>Dislivello negativo</span>
          <strong>
            {formattaQuota(
              riepilogo.dislivelloNegativo,
              "-"
            )}
          </strong>
        </article>

        <article>
          <span>Quota massima</span>
          <strong>
            {formattaQuota(riepilogo.quotaMassima)}
          </strong>
        </article>

        <article>
          <span>Quota minima</span>
          <strong>
            {formattaQuota(riepilogo.quotaMinima)}
          </strong>
        </article>
      </div>
    </section>
  );
}
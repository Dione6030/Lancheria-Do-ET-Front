import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  VictoryArea,
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryPie,
} from "victory";

const apiUrl = import.meta.env.VITE_API_URL;

// ---------- Tipos ----------

type PontoGrafico = { x: string; y: number };

type GraficosType = {
  pedidosPorDia: PontoGrafico[];
  faturamentoPorDia: PontoGrafico[];
  pagamentos: PontoGrafico[];
  maisVendidos: PontoGrafico[];
  melhorAvaliados: PontoGrafico[];
};

// ---------- Tema ----------

function temaEscuroAtivo() {
  return (
    document.documentElement.classList.contains("dark") ||
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

function coresDoTema() {
  const escuro = temaEscuroAtivo();

  return {
    texto: escuro ? "#F7F2FF" : "#20152E",
    grade: escuro ? "#3A2F55" : "#E3DAF5",
    destaque: escuro ? "#7000FF" : "#5A18C9",
    paleta: ["#5A18C9", "#00B8D9", "#F5A524", "#D6284B"],
  };
}

function estiloDosEixos(cores: ReturnType<typeof coresDoTema>) {
  return {
    axis: { stroke: cores.grade },
    grid: { stroke: cores.grade, strokeDasharray: "4" },
    tickLabels: { fill: cores.texto, fontSize: 11 },
  };
}

// ---------- Utilidades ----------

function encurtaNome(nome: string, limite = 16) {
  return nome.length > limite ? `${nome.slice(0, limite - 1)}…` : nome;
}

function formataReais(valor: number) {
  return `R$ ${valor.toFixed(0)}`;
}

async function buscarGraficos(): Promise<GraficosType> {
  const token = localStorage.getItem("token");

  const response = await fetch(`${apiUrl}/admin/graficos`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error();
  }

  return response.json();
}

// ---------- Estrutura visual ----------

function CardGrafico({
  titulo,
  vazio,
  children,
}: {
  titulo: string;
  vazio: boolean;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-claro-button-border bg-claro-superficie p-4 dark:border-escuro-button-border dark:bg-escuro-superficie">
      <h3 className="mb-2 text-center font-semibold text-claro-texto dark:text-escuro-texto">
        {titulo}
      </h3>
      {vazio ? (
        <p className="py-16 text-center text-sm text-claro-texto dark:text-escuro-texto">
          Ainda não há dados para exibir.
        </p>
      ) : (
        children
      )}
    </div>
  );
}

// ---------- Gráficos ----------

function GraficoPedidosPorDia({ dados }: { dados: PontoGrafico[] }) {
  const cores = coresDoTema();
  const estilo = estiloDosEixos(cores);

  return (
    <CardGrafico
      titulo="Pedidos por dia (últimos 7 dias)"
      vazio={dados.length === 0}
    >
      <VictoryChart
        domainPadding={20}
        padding={{ top: 20, bottom: 40, left: 40, right: 20 }}
      >
        <VictoryAxis style={estilo} />
        <VictoryAxis
          dependentAxis
          tickFormat={(t) => (Number.isInteger(t) ? t : "")}
          style={estilo}
        />
        <VictoryBar
          data={dados}
          labels={({ datum }) => datum?.y}
          style={{
            data: { fill: cores.destaque },
            labels: { fill: cores.texto, fontSize: 11 },
          }}
        />
      </VictoryChart>
    </CardGrafico>
  );
}

function GraficoFaturamentoPorDia({ dados }: { dados: PontoGrafico[] }) {
  const cores = coresDoTema();
  const estilo = estiloDosEixos(cores);

  return (
    <CardGrafico
      titulo="Faturamento por dia (últimos 7 dias)"
      vazio={dados.length === 0}
    >
      <VictoryChart padding={{ top: 20, bottom: 40, left: 65, right: 20 }}>
        <VictoryAxis style={estilo} />
        <VictoryAxis dependentAxis tickFormat={formataReais} style={estilo} />
        <VictoryArea
          data={dados}
          interpolation="monotoneX"
          style={{
            data: {
              fill: cores.destaque,
              fillOpacity: 0.35,
              stroke: cores.destaque,
              strokeWidth: 2,
            },
          }}
        />
      </VictoryChart>
    </CardGrafico>
  );
}

function GraficoPagamentos({ dados }: { dados: PontoGrafico[] }) {
  const cores = coresDoTema();

  return (
    <CardGrafico titulo="Formas de pagamento" vazio={dados.length === 0}>
      <VictoryPie
        data={dados}
        innerRadius={55}
        padAngle={2}
        colorScale={cores.paleta}
        padding={{ top: 20, bottom: 20, left: 70, right: 70 }}
        labels={({ datum }) => `${datum?.x}: ${datum?.y}`}
        style={{ labels: { fill: cores.texto, fontSize: 12 } }}
      />
    </CardGrafico>
  );
}

function GraficoMaisVendidos({ dados }: { dados: PontoGrafico[] }) {
  const cores = coresDoTema();
  const estilo = estiloDosEixos(cores);
  // Barras horizontais desenham de baixo para cima; invertemos para o 1º ficar no topo
  const ordenados = [...dados]
    .reverse()
    .map((p) => ({ ...p, x: encurtaNome(p.x) }));

  return (
    <CardGrafico
      titulo="Lanches mais vendidos (unidades)"
      vazio={dados.length === 0}
    >
      <VictoryChart
        domainPadding={15}
        padding={{ top: 20, bottom: 40, left: 120, right: 40 }}
      >
        <VictoryAxis style={estilo} />
        <VictoryAxis
          dependentAxis
          tickFormat={(t) => (Number.isInteger(t) ? t : "")}
          style={estilo}
        />
        <VictoryBar
          horizontal
          data={ordenados}
          labels={({ datum }) => datum?.y}
          style={{
            data: { fill: cores.paleta[1] },
            labels: { fill: cores.texto, fontSize: 11 },
          }}
        />
      </VictoryChart>
    </CardGrafico>
  );
}

function GraficoMelhorAvaliados({ dados }: { dados: PontoGrafico[] }) {
  const cores = coresDoTema();
  const estilo = estiloDosEixos(cores);
  const abreviados = dados.map((p) => ({ ...p, x: encurtaNome(p.x, 10) }));

  return (
    <CardGrafico
      titulo="Lanches melhor avaliados (média)"
      vazio={dados.length === 0}
    >
      <VictoryChart
        domain={{ y: [0, 5] }}
        domainPadding={20}
        padding={{ top: 20, bottom: 40, left: 40, right: 20 }}
      >
        <VictoryAxis style={estilo} />
        <VictoryAxis
          dependentAxis
          tickValues={[1, 2, 3, 4, 5]}
          style={estilo}
        />
        <VictoryBar
          data={abreviados}
          labels={({ datum }) => datum?.y}
          style={{
            data: { fill: cores.paleta[2] },
            labels: { fill: cores.texto, fontSize: 11 },
          }}
        />
      </VictoryChart>
    </CardGrafico>
  );
}

// ---------- Container ----------

export default function GraficosDashboard() {
  const [graficos, setGraficos] = useState<GraficosType | null>(null);

  useEffect(() => {
    async function carregarGraficos() {
      try {
        setGraficos(await buscarGraficos());
      } catch {
        toast.error("Não foi possível carregar os gráficos.");
      }
    }

    carregarGraficos();
  }, []);

  if (!graficos) {
    return null;
  }

  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      <GraficoPedidosPorDia dados={graficos.pedidosPorDia} />
      <GraficoFaturamentoPorDia dados={graficos.faturamentoPorDia} />
      <GraficoPagamentos dados={graficos.pagamentos} />
      <GraficoMaisVendidos dados={graficos.maisVendidos} />
      <GraficoMelhorAvaliados dados={graficos.melhorAvaliados} />
    </div>
  );
}

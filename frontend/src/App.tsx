import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
// Fundamentos
import { RazonesProporciones } from './pages/RazonesProporciones';
import { RepartoProporcional } from './pages/RepartoProporcional';
// Repartos
import { RepartoDirectoSimple } from './pages/RepartoDirectoSimple';
import { RepartoInversoSimple } from './pages/RepartoInversoSimple';
import { RepartoDirectoCompuesto } from './pages/RepartoDirectoCompuesto';
import { RepartoInversoCompuesto } from './pages/RepartoInversoCompuesto';
import { RepartoMixto } from './pages/RepartoMixto';
// Interés Simple
import { InteresSimple } from './pages/InteresSimple';
import { InteresSimpleMetodos } from './pages/InteresSimpleMetodos';
//Diagrama de Flujo de Caja
import { DiagramaFlujoCaja } from './pages/DiagramaFlujoCaja';
// Interés Compuesto
import { InteresCompuesto } from './pages/InteresCompuesto';
// Descuento Simple
import { DescuentoSimple } from './pages/DescuentoSimple';
import { DescuentoRacional } from './pages/DescuentoRacional';
// Tasas
import { TasaNominalPeriodica } from './pages/TasaNominalPeriodica';
import { TasaEfectiva } from './pages/TasaEfectiva';
import { EquivalenciaTasas } from './pages/EquivalenciaTasas';
import { TasaAnticipadaVencida } from './pages/TasaAnticipadaVencida';
// Otros
import { Capitalizacion } from './pages/Capitalizacion';
import { AnualidadesVencidas } from './pages/AnualidadesVencidas';
import { AnualidadesAnticipadas } from './pages/AnualidadesAnticipadas';
import { AnualidadesDiferidas } from './pages/AnualidadesDiferidas';
import { Perpetuidades } from './pages/Perpetuidades';
import { AnualidadesGenerales } from './pages/AnualidadesGenerales';
import { Amortizacion } from './pages/Amortizacion';
import { AbonosExtraTiempo } from './pages/AbonosExtraTiempo';
import { AbonosExtraCuota } from './pages/AbonosExtraCuota';
import { EcuacionesValor } from './pages/EcuacionesValor';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        
        {/* Fundamentos */}
        <Route path="/razones-proporciones" element={<RazonesProporciones />} />
        <Route path="/reparto-proporcional" element={<RepartoProporcional />} />
        
        {/* Repartos */}
        <Route path="/reparto-directo-simple" element={<RepartoDirectoSimple />} />
        <Route path="/reparto-inverso-simple" element={<RepartoInversoSimple />} />
        <Route path="/reparto-directo-compuesto" element={<RepartoDirectoCompuesto />} />
        <Route path="/reparto-inverso-compuesto" element={<RepartoInversoCompuesto />} />
        <Route path="/reparto-mixto" element={<RepartoMixto />} />
        
        {/* Interés Simple */}
        <Route path="/interes-simple" element={<InteresSimple />} />
        <Route path="/interes-simple-metodos" element={<InteresSimpleMetodos />} />

        {/* Diagrama de Flujo de Caja */}
        <Route path="/diagramas-flujo-caja" element={<DiagramaFlujoCaja />} />
        
        {/* Interés Compuesto */}
        <Route path="/interes-compuesto" element={<InteresCompuesto />} />        
        
        {/* Descuento Simple */}
        <Route path="/descuento-simple" element={<DescuentoSimple />} />
        <Route path="/descuento-racional" element={<DescuentoRacional />} />
        
        {/* Tasas */}
        <Route path="/tasa-nominal-periodica" element={<TasaNominalPeriodica />} />
        <Route path="/tasa-efectiva" element={<TasaEfectiva />} />
        <Route path="/equivalencia-tasas" element={<EquivalenciaTasas />} />
        <Route path="/tasa-anticipada-vencida" element={<TasaAnticipadaVencida />} />
        
        {/* Capitalización */}
        <Route path="/capitalizacion" element={<Capitalizacion />} />
        
        {/* Series Uniformes */}
        <Route path="/anualidades-vencidas" element={<AnualidadesVencidas />} />
        <Route path="/anualidades-anticipadas" element={<AnualidadesAnticipadas />} />
        <Route path="/anualidades-diferidas" element={<AnualidadesDiferidas />} />
        <Route path="/perpetuidades" element={<Perpetuidades />} />
        <Route path="/anualidades-generales" element={<AnualidadesGenerales />} />
        
        {/* Amortización */}
        <Route path="/amortizacion" element={<Amortizacion />} />
        <Route path="/abonos-extra-tiempo" element={<AbonosExtraTiempo />} />
        <Route path="/abonos-extra-cuota" element={<AbonosExtraCuota />} />
        
        {/* Ecuaciones de Valor */}
        <Route path="/ecuaciones-valor" element={<EcuacionesValor />} />
      </Route>
    </Routes>
  );
}

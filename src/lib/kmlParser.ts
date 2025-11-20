import { kml } from '@mapbox/togeojson';
import type { FeatureCollection, Feature } from 'geojson';

export interface BairroData {
  nome: string;
  feature: Feature;
  coordenadas: [number, number][];
}

//Parseia um arquivo KML e retorna um GeoJSON
export function parseKMLToGeoJSON(kmlContent: string): FeatureCollection {
  const parser = new DOMParser();
  const kmlDoc = parser.parseFromString(kmlContent, 'text/xml');
  
  const parseError = kmlDoc.querySelector('parsererror');
  if (parseError) {
    throw new Error('Erro ao parsear arquivo KML');
  }

  // Converte KML para GeoJSON usando togeojson
  if (!kml) {
    throw new Error('Erro ao carregar biblioteca toGeoJSON');
  }
  
  const geoJSON = kml(kmlDoc);
  
  return geoJSON as FeatureCollection;
}

//Extrai informações dos bairros do GeoJSON
export function extractBairrosFromGeoJSON(
  geoJSON: FeatureCollection,
  demandasPorBairro: Array<{ bairro: string; quantidade: number; cor?: string }>
): BairroData[] {
  const bairros: BairroData[] = [];
  
  const demandasMap = new Map(
    demandasPorBairro.map(item => [normalizeBairroNome(item.bairro), item])
  );

  geoJSON.features.forEach((feature) => {
    if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
      const nome = feature.properties?.name || feature.properties?.Name || 'Sem nome';
      
      // Extrai coordenadas
      let coordenadas: [number, number][] = [];
      if (feature.geometry.type === 'Polygon') {
        // Primeiro ring é o exterior, ignora holes
        coordenadas = feature.geometry.coordinates[0].map(
          coord => [coord[1], coord[0]] as [number, number] // Inverte para [lat, lng]
        );
      } else if (feature.geometry.type === 'MultiPolygon') {
        // Pega o primeiro polígono do MultiPolygon
        coordenadas = feature.geometry.coordinates[0][0].map(
          coord => [coord[1], coord[0]] as [number, number]
        );
      }

      // Busca dados de demanda correspondente
      const normalizedNome = normalizeBairroNome(nome);
      const demandaData = demandasMap.get(normalizedNome);

      // Adiciona propriedades de demanda ao feature
      if (demandaData) {
        feature.properties = {
          ...feature.properties,
          quantidade: demandaData.quantidade,
          cor: demandaData.cor || '#3b82f6',
        };
      } else {
        feature.properties = {
          ...feature.properties,
          quantidade: 0,
          cor: '#e5e7eb', // Cor padrão para bairros sem demandas
        };
      }

      bairros.push({
        nome,
        feature,
        coordenadas,
      });
    }
  });

  return bairros;
}

export function normalizeBairroNome(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

//Calcula o centro de um polígono
export function calculatePolygonCenter(coordinates: [number, number][]): [number, number] {
  if (coordinates.length === 0) {
    return [-12.7361, -60.1461]; // Centro aproximado de Vilhena
  }

  let sumLat = 0;
  let sumLng = 0;

  coordinates.forEach(([lat, lng]) => {
    sumLat += lat;
    sumLng += lng;
  });

  return [sumLat / coordinates.length, sumLng / coordinates.length];
}

// Converte coordenadas geográficas para um path SVG
export function coordenadasParaSVGPath(coordenadas: [number, number][], width: number, height: number): string {
  if (coordenadas.length === 0) return '';

  const lats = coordenadas.map(c => c[0]);
  const lngs = coordenadas.map(c => c[1]);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  // calcula escala para ajustar ao tamanho do SVG
  const latRange = maxLat - minLat || 1;
  const lngRange = maxLng - minLng || 1;
  const scaleX = (width - 20) / lngRange;
  const scaleY = (height - 20) / latRange;
  const scale = Math.min(scaleX, scaleY);

  // centraliza o SVG
  const offsetX = (width - (maxLng - minLng) * scale) / 2;
  const offsetY = (height - (maxLat - minLat) * scale) / 2;

  // Converte coordenadas para pontos SVG
  const points = coordenadas.map(([lat, lng]) => {
    const x = (lng - minLng) * scale + offsetX;
    const y = (maxLat - lat) * scale + offsetY; // Inverte Y porque SVG tem Y no topo
    return `${x},${y}`;
  });

  return `M ${points.join(' L ')} Z`;
}


"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Page « Expertises » — trait jaune qui se dessine au défilement, en fond : il part de derrière le bandeau « Pour qui » et descend jusqu'au pôle 05.
 * Relevé sur la maquette complète (repère : haut des rubans, largeur 1440) : 24 d'épaisseur, dégradé horizontal
 * #afb455 (x 1100) → #d2ba3f (x 1350). Il passe derrière les rubans, le bandeau « Pour qui », la phrase et les cartes :
 * on ne le voit qu'entre les blocs. Masqué sur mobile.
 */
const LINE =
  "M1198.8 340.0 C1200.6 350.0 1206.2 380.0 1209.7 400.0 C1213.3 420.0 1216.6 440.0 1219.8 460.0 C1223.1 480.0 1226.2 500.0 1229.2 520.0 C1232.1 540.0 1235.0 560.0 1237.8 580.0 C1240.5 600.0 1243.2 620.0 1245.7 640.0 C1248.3 660.0 1250.8 680.0 1253.2 700.0 C1255.6 720.0 1257.9 740.0 1260.2 760.0 C1262.5 780.0 1264.7 800.0 1266.8 820.0 C1269.0 840.0 1271.1 860.0 1273.1 880.0 C1275.1 900.0 1277.1 920.0 1279.1 940.0 C1281.0 960.0 1282.9 980.0 1284.7 1000.0 C1286.5 1020.0 1288.3 1040.0 1290.0 1060.0 C1291.8 1080.0 1293.4 1100.0 1295.0 1120.0 C1296.7 1140.0 1298.2 1160.0 1299.7 1180.0 C1301.2 1200.0 1302.7 1220.0 1304.1 1240.0 C1305.5 1260.0 1306.9 1280.0 1308.2 1300.0 C1309.5 1320.0 1310.8 1340.0 1312.0 1360.0 C1313.3 1380.0 1314.4 1400.0 1315.6 1420.0 C1316.7 1440.0 1317.8 1460.0 1318.8 1480.0 C1319.9 1500.0 1320.9 1520.0 1321.9 1540.0 C1322.8 1560.0 1323.8 1580.0 1324.7 1600.0 C1325.5 1620.0 1326.4 1640.0 1327.2 1660.0 C1328.0 1680.0 1328.8 1700.0 1329.6 1720.0 C1330.3 1740.0 1331.0 1760.0 1331.7 1780.0 C1332.4 1800.0 1333.0 1820.0 1333.6 1840.0 C1334.2 1860.0 1334.8 1880.0 1335.4 1900.0 C1335.9 1920.0 1336.5 1940.0 1337.0 1960.0 C1337.5 1980.0 1337.9 2000.0 1338.4 2020.0 C1338.8 2040.0 1339.2 2060.0 1339.6 2080.0 C1340.0 2100.0 1340.4 2120.0 1340.8 2140.0 C1341.1 2160.0 1341.5 2180.0 1341.8 2200.0 C1342.1 2220.0 1342.4 2240.0 1342.6 2260.0 C1342.9 2280.0 1343.1 2300.0 1343.4 2320.0 C1343.6 2340.0 1343.8 2360.0 1344.0 2380.0 C1344.1 2400.0 1344.3 2420.0 1344.4 2440.0 C1344.6 2460.0 1344.7 2480.0 1344.8 2500.0 C1344.9 2520.0 1344.9 2540.0 1345.0 2560.0 C1345.0 2580.0 1345.0 2600.0 1345.0 2620.0 C1345.0 2640.0 1345.0 2660.0 1345.0 2680.0 C1344.9 2700.0 1344.9 2720.0 1344.8 2740.0 C1344.7 2760.0 1344.6 2780.0 1344.4 2800.0 C1344.3 2820.0 1344.2 2840.0 1344.0 2860.0 C1343.8 2880.0 1343.6 2900.0 1343.4 2920.0 C1343.1 2940.0 1342.9 2960.0 1342.6 2980.0 C1342.3 3000.0 1342.1 3020.0 1341.7 3040.0 C1341.4 3060.0 1341.1 3080.0 1340.7 3100.0 C1340.3 3120.0 1340.0 3140.0 1339.5 3160.0 C1339.1 3180.0 1338.7 3200.0 1338.2 3220.0 C1337.8 3240.0 1337.3 3260.0 1336.8 3280.0 C1336.3 3300.0 1335.8 3320.0 1335.2 3340.0 C1334.7 3360.0 1334.1 3380.0 1333.5 3400.0 C1332.9 3420.0 1332.3 3440.0 1331.6 3460.0 C1331.0 3480.0 1330.3 3500.0 1329.6 3520.0 C1328.9 3540.0 1328.2 3560.0 1327.4 3580.0 C1326.7 3600.0 1325.9 3620.0 1325.1 3640.0 C1324.3 3660.0 1323.5 3680.0 1322.7 3700.0 C1321.8 3720.0 1321.0 3740.0 1320.1 3760.0 C1319.2 3780.0 1318.3 3800.0 1317.3 3820.0 C1316.4 3840.0 1315.4 3860.0 1314.4 3880.0 C1313.4 3900.0 1312.4 3920.0 1311.4 3940.0 C1310.4 3960.0 1309.3 3980.0 1308.2 4000.0 C1307.1 4020.0 1306.0 4040.0 1304.9 4060.0 C1303.7 4080.0 1302.6 4100.0 1301.4 4120.0 C1300.2 4140.0 1299.0 4160.0 1297.7 4180.0 C1296.5 4200.0 1295.2 4220.0 1293.9 4240.0 C1292.6 4260.0 1291.3 4280.0 1290.0 4300.0 C1288.7 4320.0 1287.3 4340.0 1285.9 4360.0 C1284.5 4380.0 1283.1 4400.0 1281.6 4420.0 C1280.2 4440.0 1278.7 4460.0 1277.2 4480.0 C1275.7 4500.0 1274.2 4520.0 1272.7 4540.0 C1271.1 4560.0 1269.6 4580.0 1268.0 4600.0 C1266.4 4620.0 1264.7 4640.0 1263.1 4660.0 C1261.4 4680.0 1259.8 4700.0 1258.1 4720.0 C1256.4 4740.0 1254.6 4760.0 1252.9 4780.0 C1251.1 4800.0 1249.3 4820.0 1247.5 4840.0 C1245.7 4860.0 1243.9 4880.0 1242.0 4900.0 C1240.2 4920.0 1238.3 4940.0 1236.4 4960.0 C1234.4 4980.0 1232.5 5000.0 1230.5 5020.0 C1228.6 5040.0 1226.6 5060.0 1224.5 5080.0 C1222.5 5100.0 1220.5 5120.0 1218.4 5140.0 C1216.3 5160.0 1214.2 5180.0 1212.1 5200.0 C1210.0 5220.0 1207.8 5240.0 1205.6 5260.0 C1203.4 5280.0 1201.2 5300.0 1199.0 5320.0 C1196.7 5340.0 1194.5 5360.0 1192.2 5380.0 C1189.9 5400.0 1186.5 5428.9 1185.2 5440.0 C1183.9 5451.1 1185.8 5435.4 1184.5 5446.5 C1183.2 5457.6 1179.8 5486.5 1177.4 5506.5 C1175.0 5526.5 1172.7 5546.5 1170.3 5566.5 C1168.0 5586.5 1165.6 5606.5 1163.3 5626.5 C1160.9 5646.5 1158.6 5666.5 1156.2 5686.5 C1153.9 5706.5 1151.5 5726.5 1149.1 5746.5 C1146.8 5766.5 1144.4 5786.5 1142.1 5806.5 C1139.7 5826.5 1137.4 5846.5 1135.0 5866.5 C1132.7 5886.5 1129.1 5916.5 1127.9 5926.5";
const H = 6000;

export default function ExpertisesLine({ children }: { children: React.ReactNode }) {
  const pathRef = useRef<SVGPathElement>(null);
  const tipRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const path = pathRef.current!;
    const tip = tipRef.current!;
    if (prefersReducedMotion()) {
      path.style.strokeDashoffset = "0";
      return;
    }
    const total = path.getTotalLength();
    const samples: { l: number; y: number }[] = [];
    for (let i = 0; i <= 600; i++) {
      const l = (total * i) / 600;
      samples.push({ l, y: path.getPointAtLength(l).y });
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const svg = path.ownerSVGElement!;
      const r = svg.getBoundingClientRect();
      if (!r.width) return;
      // dessiné jusqu'aux trois quarts de l'écran
      const target = (innerHeight * 0.75 - r.top) / (r.width / 1440);
      let drawn = 0;
      for (const s of samples) if (s.y <= target) drawn = s.l;
      path.style.strokeDashoffset = String(1 - drawn / total);
      const p = path.getPointAtLength(drawn);
      tip.setAttribute("cx", p.x.toFixed(1));
      tip.setAttribute("cy", p.y.toFixed(1));
      tip.classList.toggle("on", drawn > 0 && drawn < total - 1);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="exl">
      <svg className="exl-line" viewBox={`0 0 1440 ${H}`} preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="exlGrad" gradientUnits="userSpaceOnUse" x1="1100" y1="0" x2="1350" y2="0">
            <stop offset="0" stopColor="#afb455" />
            <stop offset="1" stopColor="#d2ba3f" />
          </linearGradient>
        </defs>
        <path ref={pathRef} d={LINE} pathLength={1} />
        <circle ref={tipRef} className="line-tip exl-tip" r="8" cx="0" cy="0" />
      </svg>
      {children}
    </div>
  );
}

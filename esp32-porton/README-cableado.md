# Cableado del ESP32 al control del portón

**Idea:** el relé hace lo mismo que tu dedo cuando aprieta el botón del control remoto (o la botonera de pared). No se toca nada más del motor.

## Material
- ESP32 DevKit (cualquier modelo con WiFi 2.4 GHz).
- Módulo de 1 relé de 3.3 V con optoacoplador (o uno de 5 V que acepte entrada de 3.3 V). También sirve un optoacoplador/MOSFET si el botón es de baja corriente.
- Un control remoto extra del portón (lo recomendado) o los bornes de “botonera/pulsador” de la tarjeta del motor.
- Una fuente de 5 V para el ESP32 y cables dupont.

## Conexiones
| ESP32 | Módulo relé |
|---|---|
| 5V (VIN) | VCC |
| GND | GND |
| GPIO 26 (`RELAY_PIN`) | IN |

Del lado del contacto del relé usa **COM** y **NO (normalmente abierto)**, **nunca NC**:
- COM → una pata del botón del control
- NO → la otra pata del mismo botón

Así el relé queda **en paralelo** con el botón. En reposo, sin luz o con el ESP32 reiniciando, el contacto queda **abierto**, igual que un botón que nadie aprieta.

## Reglas de seguridad
1. **Nunca puentees ni desconectes la fotocelda** ni los sensores de obstáculo o de fin de carrera. El motor debe seguir deteniéndose y reversando como siempre.
2. **El control original sigue funcionando:** no cortes cables. Solo agrega dos cables en paralelo al botón.
3. Usa el borne de **pulsador de baja tensión**. No conectes nada de 127/220 V al ESP32. Si dudas, usa un control remoto extra.
4. Revisa si el módulo es *active low*. Ajusta `RELAY_ACTIVE_HIGH` y comprueba con un multímetro que **COM–NO quede abierto al encender el ESP32** y después de desconectarlo y volverlo a conectar.
5. Pon el ESP32 en una caja, lejos de la lluvia, y donde haya buena señal WiFi.
6. **Interruptor de corte (kill switch):** un switch en serie con COM o con la alimentación del relé te permite deshabilitar todo el sistema físicamente.

## Prueba antes de instalar
Con el multímetro en continuidad entre COM y NO:
- Al encender: abierto.
- Mientras mantienes presionado en la app: cerrado.
- Al soltar: se abre en menos de 1 s.
- Si apagas el WiFi del router mientras mantienes presionado: se abre.
- Si mantienes presionado más de 30 s: se abre solo.

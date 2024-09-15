export interface lend{
    nombre: string,
    cantidad: number,
    fechaHoy: Date,
    fechaLimite: string,
    pagado: boolean,
    id: string,
    tasa: number,
    abono: number,
    multas: number,
    pendiente: number,
    abonos: number,
    total: number,
    notas: string,
    clienteID: string,
    tipo: string,
    fechaPagos: any[]
}
    import { IContrato } from '../../models/contract.model'; // Asegúrate de importar bien tu modelo
    import { handlePagoPuntual } from './handlePagoPuntual';
    import { handlePagoGracia } from './handlePagoGracia';
    import { normalizar } from '../../utils/normalize';
    import { obtenerCategoria } from './class-category-payment';
    import { csvByPagoCategoria } from './csvByPagoCategoria';


    const pagosEfectivo = ['efectivo', 'tarjeta', 'efectivo dt 001-010', 'efectivo jel 002-002', 'efectivo jcr 001-220'].map(normalizar);
    const pagosMediosDigitales = ['cobro western union', 'pagos de ahorita', 'payphone', 'recaudacion facilito', 'recaudaciones coopmego', 'cuenta transitoria banco pichincha'];
    const pagosTransferencia = ['banco pichincha', 'banco bolivariano', 'banco guayaquil', 'banco machala', 'banco produbanco', 'banco loja', 'banco solidario', 'cooperativa padre julian lorente'];
    const pagosDebitoBancario = ['cta transitorio debitos general bco loja', 'cta transitoria bco diners', 'cta transitorio banco machala', 'cta transitoria bco pichincha'];


    interface ResultadoPago {
        contrato: string;
        categoria: string;
        puntos?: number;
    }

    export async function procesarPago(contrato: IContrato, fechaPagoStr: string, tipoPago: string): Promise<ResultadoPago | null> {
        console.log("Contrato", contrato.codigo);

        if (!contrato || !contrato.fecha_corte) {
            console.warn('⚠️ Contrato inválido o sin fecha de corte');
            return null;
        }

        try {
            const fechaCorte = new Date(contrato.fecha_corte);
            const fechaPago = new Date(fechaPagoStr);

            if (isNaN(fechaCorte.getTime()) || isNaN(fechaPago.getTime())) {
                console.warn('⚠️ Fecha de corte o fecha de pago inválida');
                return null;
            }

            const inicioGracia = new Date(fechaCorte);
            inicioGracia.setDate(inicioGracia.getDate() - 10);

            console.log(`📅 Fecha de pago: ${fechaPago.toISOString()}, Fecha de corte: ${fechaCorte.toISOString()}, Inicio de gracia: ${inicioGracia.toISOString()}`);

            const tipoPagoNormalizado = normalizar(tipoPago);
            const categoriaBase = obtenerCategoria(tipoPagoNormalizado);

            if (pagosEfectivo.includes(tipoPagoNormalizado)) {

                if (!categoriaBase) {
                    console.warn(`⚠️ Tipo de pago no reconocido: ${tipoPagoNormalizado}`);
                    return null;
                }

                //console.log("💵 Pago realizado en efectivo por:", tipoPagoNormalizado);
                if (fechaPago < inicioGracia) {
                    await handlePagoPuntual(contrato, fechaPago, categoriaBase);
                    await csvByPagoCategoria.efectivo_puntual.addRow(contrato.codigo)
                    return { contrato: contrato.codigo, categoria: `${categoriaBase} PUNTUALES`, puntos: 0 };
                } else if (fechaPago > inicioGracia && fechaPago <= fechaCorte) {
                    await handlePagoGracia(contrato, fechaPago, categoriaBase);
                    await csvByPagoCategoria.efectivo_gracia.addRow(contrato.codigo)
                    return { contrato: contrato.codigo, categoria: `${categoriaBase} PERIODO DE GRACIA`, puntos: 0 };
                } else {
                    console.warn(`⚠️ Pago fuera de plazo para contrato ${contrato.codigo}`);
                    return null;
                }
            } else if (pagosMediosDigitales.includes(tipoPagoNormalizado)) {
                // console.log("💵 Pago realizado por medio digital por:", tipoPagoNormalizado);
                if (fechaPago < inicioGracia) {
                    await handlePagoPuntual(contrato, fechaPago, categoriaBase);
                    await csvByPagoCategoria.digitales_puntual.addRow(contrato.codigo)
                    return { contrato: contrato.codigo, categoria: `${categoriaBase} PERIODO DE GRACIA`, puntos: 0 };
                } else if (fechaPago > inicioGracia && fechaPago < fechaCorte) {
                    await handlePagoGracia(contrato, fechaPago, categoriaBase);
                    await csvByPagoCategoria.digitales_gracia.addRow(contrato.codigo)
                    return { contrato: contrato.codigo, categoria: `${categoriaBase} PERIODO DE GRACIA`, puntos: 0 };
                } else {
                    console.warn(`⚠️ Pago fuera de plazo para contrato ${contrato.codigo}`);
                    return null;
                }
            } else if (pagosTransferencia.includes(tipoPagoNormalizado)) {
                //console.log("💵 Pago realizado por Transferencia ");
                await csvByPagoCategoria.transferencia.addRow(contrato.codigo); // ✅ Agrega al CSV
                return { contrato: contrato.codigo, categoria: `${categoriaBase} `, puntos: 0 };
            } else if (pagosDebitoBancario.includes(tipoPagoNormalizado)) {
                //console.log("💵 Pago realizado por Débito Bancario");}
                await csvByPagoCategoria.debito.addRow(contrato.codigo)
                return { contrato: contrato.codigo, categoria: `${categoriaBase}`, puntos: 0 };
            } else {
                console.warn(`⚠️ Tipo de pago no reconocido: ${tipoPago}`);
                return null;
            }
        } catch (error) {
            console.error('❌ Error procesando pago:', error);
            return null;
        }
    }

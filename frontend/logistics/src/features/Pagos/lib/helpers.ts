export const fechaCorta = (fecha: string): string => {
    const d = new Date(fecha);
    return d.toLocaleDateString("es-DO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

export const money = (amount: number): string => {
    return new Intl.NumberFormat("es-DO", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

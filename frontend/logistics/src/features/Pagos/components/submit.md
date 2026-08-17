### MANAGE PAYMENTS FORM DATA SUDMITION

## BACKEND ✅

1. ✅ CREATE A POST ENDPOINT TO REGISTER 'transaccionPago'
2. ✅ CREATE ODTs to validate data
3. ✅ WRITE A SERVICE METHOD TO HANDLE REGISTRATION OF PAYMENT
4. ✅ REGISTER THE TYPE OF OPERATION, RATE VALUE
5. ✅ SET THE TYPE OF PAYMENT BASED ON IF documentoId IS NULL AND ordenId IS NULL
6. ✅ CALCULATE montoCalculadoVes
    - ✅ Use the tasaAplicadaId to calculate the ves values when divisaPago codigo is 'VES'
    - ✅ If tasaAplicadaId is null, then use the tasaAplicadaId linked to the ordenDespacho to calculate the ves. Make sure that the divisaOrigenId is of a divisa that is not monedabase true and codigo is 'VES'
    - ✅ If the conditions do not apply then leave this field null

## FRONTEND ✅

1. ✅ CREATE A REQUEST IN THE FEATURE TO REGISTER THE PAYMENT
2. ✅ CREATE MUTATION AND HANDLE REPONSE
3. ✅ MANAGE THIS ON THE PAGOS FEATURE 
4. ✅ the schema (../schemas/schemas.ts)
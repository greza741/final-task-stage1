function totalUangInvestor() {


    const totalUang = 1000000000

    const deposito = 350000000
    const other = 650000000
    const obligasi = 0.30 * other
    const sahamA = 0.35 * other
    const sahamB = other - obligasi - sahamA

    const depositoBunga = 0.035
    const obligasiBunga = 0.13
    const sahamABunga = 0.145
    const sahamBBunga = 0.125

    const labaDepo = deposito * depositoBunga * 2
    const labaObli = obligasi * obligasiBunga * 2
    const labaSahamA = sahamA * sahamABunga * 2
    const labaSahamB = sahamB * sahamBBunga * 2

    const totalLaba = labaDepo + labaObli + labaSahamA + labaSahamB + totalUang
    console.log(`Total uang anda setelah dua tahun : Rp ${totalLaba.toLocaleString()}`);
}

totalUangInvestor()

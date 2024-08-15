function polaGambar() {
    const rows = 5

    for (let i = 0; i < rows; i++) {
        let baris = ``

        for (let j = 0; j < i; j++) {
            baris += '  ';
        }

        const pagar = `#   `
        const tambah = `+   `


        for (let u = 0; u < rows - i; u++) {
            if (i % 2 == 0) {
                if (u % 2 == 0) {
                    baris += tambah
                } else {
                    baris += pagar
                }
            } else {
                baris += tambah
            }
        }

        console.log(baris)

    }
}

polaGambar()

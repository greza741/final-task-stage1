function soal2(arr) {
    let hasil = "Dumbways is awesome"

    let result = []

    for (let i = 0; i < hasil.length; i++) {
        let hasilHuruf = hasil[i]

        let index = arr.indexOf(hasilHuruf)

        if (index !== -1) {
            result.push(arr[index])
            arr.splice(index, 1)
        }
    }

    return result.join('')
}


let array = ["u", "D", "m", "w", "b", "a", "y", "s", "i", "s", "w", "a", "e", "s", "e", "o", "m", " ", " "]


console.log(soal2(array))
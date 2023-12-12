function muti(a, b){
    const res = []
    for(let row = 0;row<a.length;row++){
        const rowData = []
        for(let col = 0; col<b[0].length; col++){
            rowData[col] = 0
            for(let i = 0;i<b.length;i++){
                rowData[col] += a[row][i] * b[i][col]
            }
        }
        res.push(rowData)
    }

    return res
}

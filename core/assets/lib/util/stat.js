.pragma library

function mean(data) {
    if (data.length < 1)
        return 0.0

    return data.reduce(function (a, b) {
        return a + b
    }) / data.length
}

function stddev(data) {
    var N = data.length

    if (N < 2)
        return 0.0

    var samplemean = mean(data)

    return Math.sqrt(data.reduce(function (a, b) {
        return a + Math.pow((b - samplemean), 2)
    }) / (N - 1))
}

function seminormal(mean, std) {
    var x = 0.0
    for (var i = 0; i < 4; ++i) {
        x += Math.random() * 2 - 1
    }

    return x * std + mean
}

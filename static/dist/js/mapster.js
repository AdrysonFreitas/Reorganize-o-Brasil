var full_municipality_data = {}
var new_states = {}
newState("Indefinido", "#f1f1f1", [])

var keyEngaged = false

function refa(a, e) {
    a.splice(a.indexOf(e), 1)
}

function ned(type) {
    return document.createElement(type)
}

function dned(type) {
    return d3.select(ned(type))
}

function createModal() {
    var modal = ned("div")
    modal.className = "modal"
    var content = modal.appendChild(ned("div"))
    content.className = "modalContent"

    var btn = content.appendChild(ned("span"))
    btn.className = "fakeBtn close"
    btn.innerHTML = "&times;"
    btn.onclick = function() {
        disposeModal(content)
    }

    return modal
}

function showModal(modalContent) {
    document.body.appendChild(modalContent.parentElement)
    modalContent.parentElement.style.display = 'block'
}

function disposeModal(modalContent) {
    document.body.removeChild(modalContent.parentElement)
    reload()
}

function assignMunicipality(id, state) {
    state = new_states[state]
    for (var n in new_states) {
        var staten = new_states[n]
        if (staten.municipalities.includes(id)) {
            refa(new_states[n].municipalities, id)
        }
    }
    state.municipalities.push(id)
    reload()
}

function gsci(municipality) {
    for (var sid in new_states) {
        var state = new_states[sid]
        if (state.municipalities.includes(municipality)) {
            return sid
        }
    }
    console.error("gsci: no state found for " + municipality)
}

function newState(name, color, municipalities) {
    new_states[name] = {}
    new_states[name].color = color
    new_states[name].municipalities = municipalities
    reload()
}

function configState(state, nname, ncolor) {
    var old = new_states[state]
    delete new_states[state]
    new_states[nname] = old
    new_states[nname].color = "#" + ncolor
    reload()
}

function initMunicipality(id) {
    var fcd = {
        meta: {
            id: id
        },
        politics: {
            presidential2018: {},
            presidential2022: {}
        },
        population: {
            general: {
                age: {},
                sex: {},
                race: {},
                employment: {},
                indicators: {}
            },
            home: {

            },
            poverty: {
                
            },
            economy: {
                sectors: {}
            
            }
        },
    }
    full_municipality_data["BR" + id] = fcd
}

function fvor(name) {
    var radios = document.getElementsByName(name)
    for (var r in radios) {
        var radio = radios[r]
        if (radio.checked) {
            return radio.value
        }
    }
    return undefined
}

function reloadJscolor() {
    jscolor.installByClassName("jscolor");
}

var selectedState = "Indefinido"

function reloadStateList() { // needw mucho worko
    var me = d3.select("#stateList").node()
    selectedState = fvor("state")
    if (selectedState == undefined) selectedState = "Indefinido"
    me.innerHTML = ''
    var div1 = me.appendChild(ned("div"))
    //div1.style.width = "50%"
    div1.style.height = "125px"
    div1.style.overflow = "auto"
    div1.className = "column left"
    var div2 = me.appendChild(ned("div"))
    //div2.style.width = "50%"
    div2.className = "column right"
    var i = 0;
    for (var name in new_states) {
        i++
        var state = new_states[name]
        var nedt = (i % 2 != 0) ? div1 : div2
        var p = nedt.appendChild(ned("p"))
        p.className = "list-states"
        p.style.backgroundColor = state.color+"57"
        var div3 = p.appendChild(ned("div"))
        div3.className = "form-check"
        var radio = div3.appendChild(ned("input"))
        radio.type = "radio"
        radio.name = "state"
        radio.className = "form-check-input"
        radio.id = "radioState"+name
        radio.value = name
        radio.onclick = function() {
            selectedState = this.value
            var s = aggregateState(new_states[this.value])
            d3.select(".stateHeader").html(selectedState);
            d3.select(".stateName").html(selectedState);
            d3.select("#stateMunCount").html(state.municipalities.length.toLocaleString()+" municípios")
            d3.select("#statePop").html("População: ").append("b").attr("class", "fw-bold").html(s.population.total.toLocaleString())
            d3.select("#stateHDI").html("IDH: ").append("b").attr("class", "fw-bold").html(s.population.general.indicators.hdi.toLocaleString(undefined, {minimunFractionDigits: 3, maximumFractionDigits: 3}) + " <span class='fw-lighter info-detail'>" + s.population.general.indicators.hdiLevel + " <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='" + s.population.general.indicators.hdiColor + "' class='bi bi-circle-fill' viewBox='0 0 16 16' style='opacity: 1;'><circle cx='8' cy='7' r='4'/></svg></span>")
            d3.select("#stateGDP").html("PIB: ").append("b").attr("class", "fw-bold").html("R$ "+numberFormat(s.population.economy.gdp, 3))
            d3.select("#statePPC").html("Per Capita: ").append("b").attr("class", "fw-bold").html(s.population.economy.ppc.toLocaleString("pt-BR", {style:"currency", currency:"BRL"}))
            if (s.population.biggestCity != undefined) d3.select("#stateBiggestCity").html("Maior Cidade: ").append("b").attr("class", "fw-bold").html(s.population.biggestCity[1].meta.name.slice(0, -5) + " <span class='fw-lighter info-detail'>" + numberFormat(s.population.biggestCity[1].population.total, 1) + "</span>")
            d3.select("#stateArea").html("Área: ").append("b").attr("class", "fw-bold").html(numberFormat(s.area, 3) + " km²") 
            d3.select("#progressLula").attr("style", "width: " + s.politics.presidential2022.pLula.toLocaleString("en-US",{}) + "%; background-color: var(--lula-color);").attr("aria-valuenow", s.politics.presidential2022.pLula.toLocaleString("en-US",{}))
            d3.select("#progressBolsonaro").attr("style", "width: " + s.politics.presidential2022.pBolsonaro.toLocaleString("en-US",{}) + "%; background-color: var(--bolsonaro-color);").attr("aria-valuenow", s.politics.presidential2022.pBolsonaro.toLocaleString("en-US",{}))
            d3.select("#resultLula").html(s.politics.presidential2022.pLula.toLocaleString(undefined, {maximumFractionDigits: 1}) + "%")
            d3.select("#resultBolsonaro").html(s.politics.presidential2022.pBolsonaro.toLocaleString(undefined, {maximumFractionDigits: 1}) + "%")
            d3.select("#totalLula").html(s.politics.presidential2022.lula.toLocaleString() + " votos")
            d3.select("#totalBolsonaro").html(s.politics.presidential2022.bolsonaro.toLocaleString() + " votos")

            d3.select("#stateGeneralInfo").html("").append("span").attr("class", "fw-light").html("<span class='fs-6 fw-lighter mt-3'>Qualidade de vida:</span><br> Expectativa de Vida: ").append("b").attr("class", "fw-bold").html(s.population.lifeexp.toLocaleString(undefined, {minimunFractionDigits: 0, maximumFractionDigits: 1}) + " anos")
            d3.select("#stateGeneralInfo").append("span").attr("class", "fw-light").html("Anos de Estudo Esperados: ").append("b").attr("class", "fw-bold").html(s.population.exp_years_of_study.toLocaleString(undefined, {minimunFractionDigits: 1, maximumFractionDigits: 1})+" anos")
            d3.select("#stateGeneralInfo").append("span").attr("class", "fw-light").html("GINI: ").append("b").attr("class", "fw-bold").html(s.population.general.indicators.gini.toLocaleString(undefined, {minimunFractionDigits: 3, maximumFractionDigits: 3}))
            d3.select("#stateGeneralInfo").append("span").attr("class", "fw-light").html("<hr><span class='fs-6 fw-lighter mt-3'>Distribuição no território:</span><br> Densidade: ").append("b").attr("class", "fw-bold").html(s.dens.toLocaleString(undefined, {minimunFractionDigits: 2, maximumFractionDigits: 2})+ " hab/km²")
            d3.select("#stateGeneralInfo").append("span").attr("class", "fw-light").html("População urbana: ").append("b").attr("class", "fw-bold").html(s.population.urban.toLocaleString(undefined, {minimunFractionDigits: 2, maximumFractionDigits: 2})+ "%  <span class='fw-lighter info-detail'>" + numberFormat((s.population.urban/100)*s.population.total, 1).toLocaleString() + "</span>")
            d3.select("#stateGeneralInfo").append("span").attr("class", "fw-light").html("População rural: ").append("b").attr("class", "fw-bold").html(s.population.rural.toLocaleString(undefined, {minimunFractionDigits: 2, maximumFractionDigits: 2})+ "%  <span class='fw-lighter info-detail'>" + numberFormat((s.population.rural/100)*s.population.total, 1).toLocaleString() + "</span>")
            
            d3.select("#stateAgeSex").html("").append("span").attr("class", "fw-light").html("<span class='fs-6 fw-lighter mt-3'>Sexo:</span><br> Mulheres: ").append("b").attr("class", "fw-bold").html(s.population.general.sex.female.toLocaleString(undefined, {minimunFractionDigits: 2, maximumFractionDigits: 2})+ "%  <span class='fw-lighter info-detail'>" + numberFormat((s.population.general.sex.female/100)*s.population.total, 1).toLocaleString() + "</span>")
            d3.select("#stateAgeSex").append("span").attr("class", "fw-light").html("Homens: ").append("b").attr("class", "fw-bold").html(s.population.general.sex.male.toLocaleString(undefined, {minimunFractionDigits: 2, maximumFractionDigits: 2})+ "%  <span class='fw-lighter info-detail'>" + numberFormat((s.population.general.sex.male/100)*s.population.total, 1).toLocaleString() + "</span>")
            d3.select("#stateAgeSex").append("span").attr("class", "fw-light").html("<hr><span class='fs-6 fw-lighter mt-3'>Faixas etárias:</span><br> Crianças: ").append("b").attr("class", "fw-bold").html(s.population.general.age.children.toLocaleString(undefined, {minimunFractionDigits: 2, maximumFractionDigits: 2})+ "%  <span class='fw-lighter info-detail'>" + numberFormat((s.population.general.age.children/100)*s.population.total, 1).toLocaleString() + "</span>")
            d3.select("#stateAgeSex").append("span").attr("class", "fw-light").html("Adolescentes: ").append("b").attr("class", "fw-bold").html(s.population.general.age.teenagers.toLocaleString(undefined, {minimunFractionDigits: 2, maximumFractionDigits: 2})+ "%  <span class='fw-lighter info-detail'>" + numberFormat((s.population.general.age.teenagers/100)*s.population.total, 1).toLocaleString() + "</span>")
            d3.select("#stateAgeSex").append("span").attr("class", "fw-light").html("Jovem Adultos: ").append("b").attr("class", "fw-bold").html(s.population.general.age.youngAdults.toLocaleString(undefined, {minimunFractionDigits: 2, maximumFractionDigits: 2})+ "%  <span class='fw-lighter info-detail'>" + numberFormat((s.population.general.age.youngAdults/100)*s.population.total, 1).toLocaleString() + "</span>")
            d3.select("#stateAgeSex").append("span").attr("class", "fw-light").html("Adultos: ").append("b").attr("class", "fw-bold").html(s.population.general.age.adults.toLocaleString(undefined, {minimunFractionDigits: 2, maximumFractionDigits: 2})+ "%  <span class='fw-lighter info-detail'>" + numberFormat((s.population.general.age.adults/100)*s.population.total, 1).toLocaleString() + "</span>")
            d3.select("#stateAgeSex").append("span").attr("class", "fw-light").html("Idosos: ").append("b").attr("class", "fw-bold").html(s.population.general.age.elderly.toLocaleString(undefined, {minimunFractionDigits: 2, maximumFractionDigits: 2})+ "%  <span class='fw-lighter info-detail'>" + numberFormat((s.population.general.age.elderly/100)*s.population.total, 1).toLocaleString() + "</span>")

            d3.select("#stateHomes").html("").append("span").attr("class", "fw-light").html("Água e Esgoto Inadequados: ").append("b").attr("class", "fw-bold").html(s.population.home.bad_sewage.toLocaleString(undefined, {minimunFractionDigits: 2, maximumFractionDigits: 2}) + "%")
            d3.select("#stateHomes").append("span").attr("class", "fw-light").html("Água Encanada: ").append("b").attr("class", "fw-bold").html(s.population.home.water.toLocaleString(undefined, {minimunFractionDigits: 2, maximumFractionDigits: 2}) + "%")
            d3.select("#stateHomes").append("span").attr("class", "fw-light").html("Coleta de Lixo: ").append("b").attr("class", "fw-bold").html(s.population.home.garbage.toLocaleString(undefined, {minimunFractionDigits: 2, maximumFractionDigits: 2}) + "%")
            d3.select("#stateHomes").append("span").attr("class", "fw-light").html("Energia Elétrica: ").append("b").attr("class", "fw-bold").html(s.population.home.energy.toLocaleString(undefined, {minimunFractionDigits: 2, maximumFractionDigits: 2}) + "%")

            d3.select("#statePoverty").html("").append("span").attr("class", "fw-light").html("Extrema Pobreza: ").append("b").attr("class", "fw-bold").html(s.population.poverty.extremely_poor.toLocaleString(undefined, {minimunFractionDigits: 2, maximumFractionDigits: 2})+ "%  <span class='fw-lighter info-detail'>" + numberFormat((s.population.poverty.extremely_poor/100)*s.population.total, 1).toLocaleString() + "</span>")
            d3.select("#statePoverty").append("span").attr("class", "fw-light").html("Pobres: ").append("b").attr("class", "fw-bold").html(s.population.poverty.poor.toLocaleString(undefined, {minimunFractionDigits: 2, maximumFractionDigits: 2})+ "%  <span class='fw-lighter info-detail'>" + numberFormat((s.population.poverty.poor/100)*s.population.total, 1).toLocaleString() + "</span>")
            d3.select("#statePoverty").append("span").attr("class", "fw-light").html("Vulneráveis a Pobreza: ").append("b").attr("class", "fw-bold").html(s.population.poverty.vulnerability.toLocaleString(undefined, {minimunFractionDigits: 2, maximumFractionDigits: 2})+ "%  <span class='fw-lighter info-detail'>" + numberFormat((s.population.poverty.vulnerability/100)*s.population.total, 1).toLocaleString() + "</span>")

            // var table = d3.select("#statePolitics")
            // var tbody = table.select("tbody")
            // tbody.html('')
            // var e16 = tbody.append("tr")
            // e16.append("td").html('2022 Presidential Election')
            // if (s.politics.presidential2016.dem > s.politics.presidential2016.gop) {
            //     e16.append("td").style("color", "darkblue").html("Clinton +" + s.politics.presidential2016.margin * -1)
            // }
            // else {
            //     e16.append("td").style("color", "darkred").html("Trump +" + s.politics.presidential2016.margin)
            // }
            // e16 = tbody.append('tr')
            // e16.append("td").html("2012 Presidential Election")
            // if (s.politics.presidential2012.dem > s.politics.presidential2012.gop) {
            //     e16.append("td").style("color", "darkblue").html("Obama +" + s.politics.presidential2012.margin * -1)
            // }
            // else {
            //     e16.append("td").style("color", "darkred").html("Romney +" + s.politics.presidential2012.margin)
            // }
            // e16 = tbody.append("tr")
            // e16.append("td").html("")
            // s.politics.swing = round(s.politics.swing, 2)
            // if (s.politics.swing < 0) {
            //     e16.append("td").style("color", "darkblue").html("D +" + s.politics.swing * -1 + " Swing")
            // }
            // else {
            //     e16.append("td").style("color", "darkred").html("R +" + s.politics.swing + " Swing")
            // }
            // e16 = tbody.append("tr")
            // e16.append("td").html("")
            // s.politics.pvi = round(s.politics.pvi, 2)
            // if (s.politics.pvi < 0) {
            //     e16.append("td").style("color", "darkblue").html("D +" + s.politics.pvi * -1 + " PVI")
            // }
            // else {
            //     e16.append("td").style("color", "darkred").html("R +" + s.politics.pvi + " PVI")
            // }

            var elsl = document.getElementById("state-lists-select")
            elsl.dispatchEvent(new Event('change'));

            d3.select("#state-lists-select").on("change", function() {
                var selectedList = this.value;
                var table = d3.select("#stateCities");
                var tbody = table.select("tbody")
                s = aggregateState(new_states[selectedState])
                switch (selectedList) {
                    case "1":
                    case "9":
                        tbody.html('')

                        d3.select("#stateCitiesHeader").html("Maiores cidades")
                        d3.select("#stateCitiesCol3").html("População")
                        d3.select("#removable-th").remove()
                        var municipalitiesbyPop = s.municipalitiesbyPop

                        if (selectedList == "9") {
                            d3.select("#stateCitiesHeader").html("Menores cidades")
                            municipalitiesbyPop = Object
                            .entries(s.municipalitiesList)
                            .sort((a, b) => a[1].population.total - b[1].population.total);
                        }
                        
                        for (var id in municipalitiesbyPop) {
                            var city = municipalitiesbyPop[id]
                            var line = tbody.append("tr")
                            line.append("td").html((Number(id)+1).toLocaleString())
                            line.append("td").html(city[1].meta.name.slice(0, -5))
                            line.append("td").html(city[1].population.total.toLocaleString())
                            if (id == 14) break
                        }
                        break;
                    case "2":
                    case "10":
                        tbody.html('')

                        d3.select("#stateCitiesHeader").html("Melhores cidades por IDH")
                        d3.select("#stateCitiesCol3").html("IDH")
                        d3.select("#removable-th").remove()
                        d3.select("#stateCitiesThs").append("th").attr("scope","col").attr("id","removable-th").html("Nível")
                        
                        var sortedList 
                        if (selectedList == "2"){
                            sortedList = Object
                            .entries(s.municipalitiesList)
                            .sort((a, b) => b[1].population.general.indicators.hdi - a[1].population.general.indicators.hdi);
                        }

                        if (selectedList == "10") {
                            d3.select("#stateCitiesHeader").html("Piores cidades por IDH")
                            sortedList = Object
                            .entries(s.municipalitiesList)
                            .sort((a, b) => a[1].population.general.indicators.hdi - b[1].population.general.indicators.hdi);
                        }
                        var counter = 0

                        for (var id in sortedList) {
                            var city = sortedList[id], hdiLevel, hdiColor

                            if (city[1].population.general.indicators.hdi == 0) continue

                            var line = tbody.append("tr")
                            line.append("td").html((counter+1).toLocaleString())
                            line.append("td").html(city[1].meta.name.slice(0, -5))
                            line.append("td").html(city[1].population.general.indicators.hdi.toLocaleString(undefined, {minimunFractionDigits: 3, maximumFractionDigits: 3}))

                            if (city[1].population.general.indicators.hdi >= 0.800) { hdiLevel = "Muito Alto"; hdiColor = "var(--hdi-very-high)" } else
                            if (city[1].population.general.indicators.hdi >= 0.700) { hdiLevel = "Alto"; hdiColor = "var(--hdi-high)" } else
                            if (city[1].population.general.indicators.hdi >= 0.550) { hdiLevel = "Médio"; hdiColor = "var(--hdi-medium)" } else { hdiLevel = "Baixo"; hdiColor = "var(--hdi-low)" }

                            line.append("td").html("<span class='fw-bolder' style='color: " + hdiColor + ";filter: contrast(0.5);'>" + hdiLevel + "</span>")
                            
                            counter++
                            if (counter == 15) break
                        }
                        break;
                    case "3":
                    case "11":
                        tbody.html('')

                        d3.select("#stateCitiesHeader").html("Cidades mais ricas por PIB")
                        d3.select("#stateCitiesCol3").html("PIB")
                        d3.select("#removable-th").remove()
                        
                        var sortedList;
                        
                        if (selectedList == "3") {
                            sortedList = Object
                            .entries(s.municipalitiesList)
                            .sort((a, b) => b[1].population.economy.gdp - a[1].population.economy.gdp);
                        }

                        if (selectedList == "11") {
                            d3.select("#stateCitiesHeader").html("Cidades menos ricas por PIB")
                            sortedList = Object
                            .entries(s.municipalitiesList)
                            .sort((a, b) => a[1].population.economy.gdp - b[1].population.economy.gdp);
                        }

                        for (var id in sortedList) {
                            var city = sortedList[id]
                            var line = tbody.append("tr")
                            line.append("td").html((Number(id)+1).toLocaleString())
                            line.append("td").html(city[1].meta.name.slice(0, -5))
                            line.append("td").html(numberFormat(city[1].population.economy.gdp, 1))
                            
                            if (id == 14) break
                        }
                        break;
                    case "4":
                    case "12":
                        tbody.html('')

                        d3.select("#stateCitiesHeader").html("Cidades mais ricas por PIB Per Capita")
                        d3.select("#stateCitiesCol3").html("PIB Per Capita")
                        d3.select("#removable-th").remove()
                    
                        var sortedList;
                        
                        if (selectedList == "4") {
                            sortedList = Object
                            .entries(s.municipalitiesList)
                            .sort((a, b) => b[1].population.economy.per_capita - a[1].population.economy.per_capita);
                        }

                        if (selectedList == "12") {
                            d3.select("#stateCitiesHeader").html("Cidades menos ricas por PIB Per Capita")
                            sortedList = Object
                            .entries(s.municipalitiesList)
                            .sort((a, b) => a[1].population.economy.per_capita - b[1].population.economy.per_capita);
                        }

                        for (var id in sortedList) {
                            var city = sortedList[id]
                            var line = tbody.append("tr")
                            line.append("td").html((Number(id)+1).toLocaleString())
                            line.append("td").html(city[1].meta.name.slice(0, -5))
                            line.append("td").html(city[1].population.economy.per_capita.toLocaleString("pt-BR", {style:"currency", currency:"BRL"}))
                            
                            if (id == 14) break
                        }
                        break;
                    case "5":
                    case "13":
                        tbody.html('')

                        d3.select("#stateCitiesHeader").html("Cidades com maior longevidade")
                        d3.select("#stateCitiesCol3").html("Exp. de Vida")
                        d3.select("#removable-th").remove()

                        var sortedList;
                        
                        if (selectedList == "5") {
                            sortedList = Object
                            .entries(s.municipalitiesList)
                            .sort((a, b) => b[1].population.lifeexp - a[1].population.lifeexp);
                        }

                        if (selectedList == "13") {
                            d3.select("#stateCitiesHeader").html("Cidades com menor longevidade")
                            sortedList = Object
                            .entries(s.municipalitiesList)
                            .sort((a, b) => a[1].population.lifeexp - b[1].population.lifeexp);
                        }
                        var counter = 0;

                        for (var id in sortedList) {
                            var city = sortedList[id]

                            if (city[1].population.lifeexp == 0) continue

                            var line = tbody.append("tr")
                            line.append("td").html((counter+1).toLocaleString())
                            line.append("td").html(city[1].meta.name.slice(0, -5))
                            line.append("td").html(city[1].population.lifeexp.toLocaleString())
                            
                            counter++
                            if (counter == 15) break
                        }
                        break;
                    case "6":
                    case "14":
                        tbody.html('')

                        d3.select("#stateCitiesHeader").html("Cidades menos desiguais por Gini")
                        d3.select("#stateCitiesCol3").html("Gini")
                        d3.select("#removable-th").remove()

                        var sortedList;
                        
                        if (selectedList == "6") {
                            sortedList = Object
                            .entries(s.municipalitiesList)
                            .sort((a, b) => a[1].population.general.indicators.gini - b[1].population.general.indicators.gini);
                        }

                        if (selectedList == "14") {
                            d3.select("#stateCitiesHeader").html("Cidades mais desiguais por Gini")
                            sortedList = Object
                            .entries(s.municipalitiesList)
                            .sort((a, b) => b[1].population.general.indicators.gini - a[1].population.general.indicators.gini);
                        }
                        var counter = 0

                        for (var id in sortedList) {
                            var city = sortedList[id]

                            if (city[1].population.general.indicators.gini == 0) continue

                            var line = tbody.append("tr")
                            line.append("td").html((Number(counter)+1).toLocaleString())
                            line.append("td").html(city[1].meta.name.slice(0, -5))
                            line.append("td").html(city[1].population.general.indicators.gini.toLocaleString(undefined, {minimunFractionDigits: 3, maximumFractionDigits: 3}))
                            
                            counter++
                            if (counter == 15) break
                        }
                        break;
                    case "7":
                    case "15":
                        tbody.html('')

                        d3.select("#stateCitiesHeader").html("Cidades com mais água e esgoto inadequados (%)")
                        d3.select("#stateCitiesCol3").html("Taxa")
                        d3.select("#removable-th").remove()

                        var sortedList = Object
                        .entries(s.municipalitiesList)
                        .sort((a, b) => b[1].population.home.bad_sewage - a[1].population.home.bad_sewage);
                        
                        var sortedList;
                        
                        if (selectedList == "7") {
                            sortedList = Object
                            .entries(s.municipalitiesList)
                            .sort((a, b) => b[1].population.home.bad_sewage - a[1].population.home.bad_sewage);
                        }

                        if (selectedList == "15") {
                            d3.select("#stateCitiesHeader").html("Cidades com menos água e esgoto inadequados (%)")
                            sortedList = Object
                            .entries(s.municipalitiesList)
                            .sort((a, b) => a[1].population.home.bad_sewage - b[1].population.home.bad_sewage);
                        }
                        var counter = 0;

                        for (var id in sortedList) {
                            var city = sortedList[id]

                            if (city[1].population.home.bad_sewage == 0) continue

                            var line = tbody.append("tr")
                            line.append("td").html((counter+1).toLocaleString())
                            line.append("td").html(city[1].meta.name.slice(0, -5))
                            line.append("td").html(city[1].population.home.bad_sewage.toLocaleString(undefined, {minimunFractionDigits: 2, maximumFractionDigits: 2}) + "%")
                            
                            counter++
                            if (counter == 15) break
                        }
                        break;
                    case "8":
                    case "16":
                        tbody.html('')

                        d3.select("#stateCitiesHeader").html("Cidades com mais pobres (%)")
                        d3.select("#stateCitiesCol3").html("Taxa")
                        d3.select("#removable-th").remove()
                        d3.select("#stateCitiesThs").append("th").attr("scope","col").attr("id","removable-th").html("Total")
                    
                        var sortedList;
                        
                        if (selectedList == "8") {
                            sortedList = Object
                            .entries(s.municipalitiesList)
                            .sort((a, b) => b[1].population.poverty.poor - a[1].population.poverty.poor);
                        }

                        if (selectedList == "16") {
                            d3.select("#stateCitiesHeader").html("Cidades com menos pobres (%)")
                            sortedList = Object
                            .entries(s.municipalitiesList)
                            .sort((a, b) => a[1].population.poverty.poor - b[1].population.poverty.poor);
                        }
                        var counter = 0;

                        for (var id in sortedList) {
                            var city = sortedList[id]

                            if (city[1].population.poverty.poor == 0.00) continue

                            var line = tbody.append("tr")
                            line.append("td").html((counter+1).toLocaleString())
                            line.append("td").html(city[1].meta.name.slice(0, -5))
                            line.append("td").html(city[1].population.poverty.poor.toLocaleString(undefined, {minimunFractionDigits: 2, maximumFractionDigits: 2}) + "%")
                            line.append("td").html(numberFormat((city[1].population.poverty.poor/100)*city[1].population.total, 1))

                            counter++
                            if (counter == 15) break
                        }
                        break;
                    case "17":
                    case "18":
                    case "19":
                    case "20":
                        tbody.html('')

                        d3.select("#stateCitiesHeader").html("Maiores territórios")
                        d3.select("#stateCitiesCol3").html("Área (km²)")
                        d3.select("#removable-th").remove()
                        
                        var sortedList;
                        
                        if (selectedList == "17") {
                            sortedList = Object
                            .entries(s.municipalitiesList)
                            .sort((a, b) => b[1].meta.area - a[1].meta.area);
                        }

                        if (selectedList == "18") {
                            d3.select("#stateCitiesHeader").html("Menores territórios")
                            sortedList = Object
                            .entries(s.municipalitiesList)
                            .sort((a, b) => a[1].meta.area - b[1].meta.area);
                        }

                        if (selectedList == "19") {
                            d3.select("#stateCitiesHeader").html("Cidades mais densamente povoadas")
                            d3.select("#stateCitiesCol3").html("Densidade (hab/km²)")
                            sortedList = Object
                            .entries(s.municipalitiesList)
                            .sort((a, b) => b[1].meta.dens - a[1].meta.dens);
                        }

                        if (selectedList == "20") {
                            d3.select("#stateCitiesHeader").html("Cidades menos densamente povoadas")
                            d3.select("#stateCitiesCol3").html("Densidade (hab/km²)")
                            sortedList = Object
                            .entries(s.municipalitiesList)
                            .sort((a, b) => a[1].meta.dens - b[1].meta.dens);
                        }

                        for (var id in sortedList) {
                            var city = sortedList[id]
                            var line = tbody.append("tr")
                            line.append("td").html((Number(id)+1).toLocaleString())
                            line.append("td").html(city[1].meta.name.slice(0, -5))
                            if (selectedList == "17" || selectedList == "18") {line.append("td").html(numberFormat(city[1].meta.area, 1))} else {line.append("td").html(city[1].meta.dens.toLocaleString(undefined, {minimunFractionDigits: 2, maximumFractionDigits: 2}))};
                            
                            if (id == 14) break
                        }
                        break;
                    case "21":
                    case "22":
                        tbody.html('')

                        d3.select("#stateCitiesHeader").html("Cidades que mais votaram no Lula (%)")
                        d3.select("#stateCitiesCol3").html("Porcentagem")
                        d3.select("#removable-th").remove()
                        d3.select("#stateCitiesThs").append("th").attr("scope","col").attr("id","removable-th").html("Votos")
                    
                        var sortedList;
                        
                        if (selectedList == "21") {
                            sortedList = Object
                            .entries(s.municipalitiesList)
                            .sort((a, b) => b[1].politics.presidential2022.pLula - a[1].politics.presidential2022.pLula);
                        }

                        if (selectedList == "22") {
                            d3.select("#stateCitiesHeader").html("Cidades que mais votaram no Bolsonaro (%)")
                            sortedList = Object
                            .entries(s.municipalitiesList)
                            .sort((a, b) => b[1].politics.presidential2022.pBolsonaro - a[1].politics.presidential2022.pBolsonaro);
                        }
                        var counter = 0;

                        for (var id in sortedList) {
                            var city = sortedList[id]

                            var line = tbody.append("tr")
                            line.append("td").html((counter+1).toLocaleString())
                            line.append("td").html(city[1].meta.name.slice(0, -5))
                            if (selectedList == "21") {
                                line.append("td").html(city[1].politics.presidential2022.pLula.toLocaleString(undefined, {minimunFractionDigits: 2, maximumFractionDigits: 2}) + "%")
                                line.append("td").html(numberFormat(city[1].politics.presidential2022.lula, 1))
                            } else {
                                line.append("td").html(city[1].politics.presidential2022.pBolsonaro.toLocaleString(undefined, {minimunFractionDigits: 2, maximumFractionDigits: 2}) + "%")
                                line.append("td").html(numberFormat(city[1].politics.presidential2022.bolsonaro, 1))
                            }
                            
                            counter++
                            if (counter == 15) break
                        }
                        break;
                }
            })

            d3.select("#lists-select-parent").html("")
            var el = document.getElementById("lists-select")
            el.dispatchEvent(new Event('change'));

            d3.select("#lists-select").on("change", function() {
                var selectedList = this.value;
                switch (selectedList) {
                    case "1":
                        d3.select("#lists-select-parent").html("").append("p").attr("class", "h4 fw-bolder mt-3")
                        .html("Maiores estados <br>").append("span").attr("class","lead fs-5").html("Por população")
                        var table = d3.select("#lists-select-parent").append("table").attr("class","table table-striped lists-table").html('<thead><tr><th scope="col">#</th><th scope="col">Estado</th><th scope="col">População</th></tr></thead>')
                        var tbody = table.append("tbody").html("")
                        
                        var aggregateStateList = {}
                        for (var name in new_states) {
                            var state = new_states[name]
                            var s = aggregateState(state)
                            aggregateStateList[name] = s
                        }
                        
                        var sortedList = Object
                        .entries(aggregateStateList)
                        .sort((a, b) => b[1].population.total - a[1].population.total);
    
                        for (var id in sortedList) {
                            var state_instance = sortedList[id]
                            var line = tbody.append("tr").attr("style", "border-bottom: 0.2rem solid " + state_instance[1].color + "6b")
                            if (state_instance[0] != selectedState){
                                line.append("td").html((Number(id)+1).toLocaleString())
                                line.append("td").html(state_instance[0])
                                line.append("td").html(state_instance[1].population.total.toLocaleString())
                            } else {
                                line.append("td").html("<span class='fw-bolder'>" + (Number(id)+1).toLocaleString() + "</span>")
                                line.append("td").html("<span class='fw-bolder'>" + state_instance[0] + "</span>")
                                line.append("td").html("<span class='fw-bolder'>" + state_instance[1].population.total.toLocaleString() + "</span>")
                            }
                        }
                        break;
                    case "2":
                        d3.select("#lists-select-parent").html("").append("p").attr("class", "h4 fw-bolder mt-3")
                        .html("Melhores estados pra se viver <br>").append("span").attr("class","lead fs-5").html("Por IDH")
                        var table = d3.select("#lists-select-parent").append("table").attr("class","table table-striped lists-table").html('<thead><tr><th scope="col">#</th><th scope="col">Estado</th><th scope="col">IDH</th><th scope="col">Nível</th></tr></thead>')
                        var tbody = table.append("tbody").html("")
                        
                        var aggregateStateList = {}
                        for (var name in new_states) {
                            var state = new_states[name]
                            var s = aggregateState(state)
                            aggregateStateList[name] = s
                        }
                        
                        var sortedList = Object
                        .entries(aggregateStateList)
                        .sort((a, b) => b[1].population.general.indicators.hdi - a[1].population.general.indicators.hdi);
    
                        for (var id in sortedList) {
                            var state_instance = sortedList[id]
                            var line = tbody.append("tr")
                            if (state_instance[0] != selectedState){
                                line.append("td").html((Number(id)+1).toLocaleString())
                                line.append("td").html(state_instance[0])
                                line.append("td").html(state_instance[1].population.general.indicators.hdi.toLocaleString(undefined, {minimunFractionDigits: 3, maximumFractionDigits: 3}))
                                line.append("td").html("<span style='color: " + state_instance[1].population.general.indicators.hdiColor + ";filter: contrast(0.5);'>" + state_instance[1].population.general.indicators.hdiLevel + "</span>")
                            } else {
                                line.append("td").html("<span class='fw-bolder'>" + (Number(id)+1).toLocaleString() + "</span>")
                                line.append("td").html("<span class='fw-bolder'>" + state_instance[0] + "</span>")
                                line.append("td").html("<span class='fw-bolder'>" + state_instance[1].population.general.indicators.hdi.toLocaleString(undefined, {minimunFractionDigits: 3, maximumFractionDigits: 3}) + "</span>")
                                line.append("td").html("<span class='fw-bolder' style='color: " + state_instance[1].population.general.indicators.hdiColor + ";filter: contrast(0.5);'>" + state_instance[1].population.general.indicators.hdiLevel + "</span>")
                            }
                        }
                        break;
                    case "3":
                        d3.select("#lists-select-parent").html("").append("p").attr("class", "h4 fw-bolder mt-3")
                        .html("Estados mais ricos <br>").append("span").attr("class","lead fs-5").html("Por PIB")
                        var table = d3.select("#lists-select-parent").append("table").attr("class","table table-striped lists-table").html('<thead><tr><th scope="col">#</th><th scope="col">Estado</th><th scope="col">PIB</th></tr></thead>')
                        var tbody = table.append("tbody").html("")
                        
                        var aggregateStateList = {}
                        for (var name in new_states) {
                            var state = new_states[name]
                            var s = aggregateState(state)
                            aggregateStateList[name] = s
                        }
                        
                        var sortedList = Object
                        .entries(aggregateStateList)
                        .sort((a, b) => b[1].population.economy.gdp - a[1].population.economy.gdp);
    
                        for (var id in sortedList) {
                            var state_instance = sortedList[id]
                            var line = tbody.append("tr").attr("style", "border-bottom: 0.2rem solid " + state_instance[1].color + "6b")
                            if (state_instance[0] != selectedState){
                                line.append("td").html((Number(id)+1).toLocaleString())
                                line.append("td").html(state_instance[0])
                                line.append("td").html("R$ "+numberFormat(state_instance[1].population.economy.gdp, 3))
                            } else {
                                line.append("td").html("<span class='fw-bolder'>" + (Number(id)+1).toLocaleString() + "</span>")
                                line.append("td").html("<span class='fw-bolder'>" + state_instance[0] + "</span>")
                                line.append("td").html("<span class='fw-bolder'>" + "R$ "+numberFormat(state_instance[1].population.economy.gdp, 3) + "</span>")
                            }
                        }
                        break;
                    case "4":
                        d3.select("#lists-select-parent").html("").append("p").attr("class", "h4 fw-bolder mt-3")
                        .html("Estados mais ricos <br>").append("span").attr("class","lead fs-5").html("Por PIB Per Capita")
                        var table = d3.select("#lists-select-parent").append("table").attr("class","table table-striped lists-table").html('<thead><tr><th scope="col">#</th><th scope="col">Estado</th><th scope="col">PIB Per Capita</th></tr></thead>')
                        var tbody = table.append("tbody").html("")
                        
                        var aggregateStateList = {}
                        for (var name in new_states) {
                            var state = new_states[name]
                            var s = aggregateState(state)
                            aggregateStateList[name] = s
                        }
                        
                        var sortedList = Object
                        .entries(aggregateStateList)
                        .sort((a, b) => b[1].population.economy.ppc - a[1].population.economy.ppc);
    
                        for (var id in sortedList) {
                            var state_instance = sortedList[id]
                            var line = tbody.append("tr").attr("style", "border-bottom: 0.2rem solid " + state_instance[1].color + "6b")
                            if (state_instance[0] != selectedState){
                                line.append("td").html((Number(id)+1).toLocaleString())
                                line.append("td").html(state_instance[0])
                                line.append("td").html(state_instance[1].population.economy.ppc.toLocaleString("pt-BR", {style:"currency", currency:"BRL"}))
                            } else {
                                line.append("td").html("<span class='fw-bolder'>" + (Number(id)+1).toLocaleString() + "</span>")
                                line.append("td").html("<span class='fw-bolder'>" + state_instance[0] + "</span>")
                                line.append("td").html("<span class='fw-bolder'>" + state_instance[1].population.economy.ppc.toLocaleString("pt-BR", {style:"currency", currency:"BRL"}) + "</span>")
                            }
                        }
                        break;
                    case "5":
                        d3.select("#lists-select-parent").html("").append("p").attr("class", "h4 fw-bolder mt-3")
                        .html("Estados com maior longevidade <br>").append("span").attr("class","lead fs-5").html("Por Expectativa de Vida")
                        var table = d3.select("#lists-select-parent").append("table").attr("class","table table-striped lists-table").html('<thead><tr><th scope="col">#</th><th scope="col">Estado</th><th scope="col">Exp. de Vida</th></tr></thead>')
                        var tbody = table.append("tbody").html("")
                        
                        var aggregateStateList = {}
                        for (var name in new_states) {
                            var state = new_states[name]
                            var s = aggregateState(state)
                            aggregateStateList[name] = s
                        }
                        
                        var sortedList = Object
                        .entries(aggregateStateList)
                        .sort((a, b) => b[1].population.lifeexp - a[1].population.lifeexp);
    
                        for (var id in sortedList) {
                            var state_instance = sortedList[id]
                            var line = tbody.append("tr").attr("style", "border-bottom: 0.2rem solid " + state_instance[1].color + "6b")
                            if (state_instance[0] != selectedState){
                                line.append("td").html((Number(id)+1).toLocaleString())
                                line.append("td").html(state_instance[0])
                                line.append("td").html(state_instance[1].population.lifeexp.toLocaleString(undefined, {minimunFractionDigits: 1, maximumFractionDigits: 1}))
                            } else {
                                line.append("td").html("<span class='fw-bolder'>" + (Number(id)+1).toLocaleString() + "</span>")
                                line.append("td").html("<span class='fw-bolder'>" + state_instance[0] + "</span>")
                                line.append("td").html("<span class='fw-bolder'>" + state_instance[1].population.lifeexp.toLocaleString(undefined, {minimunFractionDigits: 1, maximumFractionDigits: 1}) + "</span>")
                            }
                        }
                        break;
                    case "6":
                        d3.select("#lists-select-parent").html("").append("p").attr("class", "h4 fw-bolder mt-3")
                        .html("Estados menos desiguais <br>").append("span").attr("class","lead fs-5").html("Pelo Coeficiente Gini")
                        var table = d3.select("#lists-select-parent").append("table").attr("class","table table-striped lists-table").html('<thead><tr><th scope="col">#</th><th scope="col">Estado</th><th scope="col">Gini</th></tr></thead>')
                        var tbody = table.append("tbody").html("")
                        
                        var aggregateStateList = {}
                        for (var name in new_states) {
                            var state = new_states[name]
                            var s = aggregateState(state)
                            aggregateStateList[name] = s
                        }
                        
                        var sortedList = Object
                        .entries(aggregateStateList)
                        .sort((a, b) => a[1].population.general.indicators.gini - b[1].population.general.indicators.gini);
    
                        for (var id in sortedList) {
                            var state_instance = sortedList[id]
                            var line = tbody.append("tr").attr("style", "border-bottom: 0.2rem solid " + state_instance[1].color + "6b")
                            if (state_instance[0] != selectedState){
                                line.append("td").html((Number(id)+1).toLocaleString())
                                line.append("td").html(state_instance[0])
                                line.append("td").html(state_instance[1].population.general.indicators.gini.toLocaleString(undefined, {minimunFractionDigits: 3, maximumFractionDigits: 3}))
                            } else {
                                line.append("td").html("<span class='fw-bolder'>" + (Number(id)+1).toLocaleString() + "</span>")
                                line.append("td").html("<span class='fw-bolder'>" + state_instance[0] + "</span>")
                                line.append("td").html("<span class='fw-bolder'>" + state_instance[1].population.general.indicators.gini.toLocaleString(undefined, {minimunFractionDigits: 3, maximumFractionDigits: 3}) + "</span>")    
                            }
                        }
                        break;
                    case "7":
                        d3.select("#lists-select-parent").html("").append("p").attr("class", "h4 fw-bolder mt-3")
                        .html("Estados com mais água e esgoto inadequados <br>").append("span").attr("class","lead fs-5").html("Por Porcentagem de Domicílios")
                        var table = d3.select("#lists-select-parent").append("table").attr("class","table table-striped lists-table").html('<thead><tr><th scope="col">#</th><th scope="col">Estado</th><th scope="col">Taxa</th></tr></thead>')
                        var tbody = table.append("tbody").html("")
                        
                        var aggregateStateList = {}
                        for (var name in new_states) {
                            var state = new_states[name]
                            var s = aggregateState(state)
                            aggregateStateList[name] = s
                        }
                        
                        var sortedList = Object
                        .entries(aggregateStateList)
                        .sort((a, b) => b[1].population.home.bad_sewage - a[1].population.home.bad_sewage);
    
                        for (var id in sortedList) {
                            var state_instance = sortedList[id]
                            var line = tbody.append("tr").attr("style", "border-bottom: 0.2rem solid " + state_instance[1].color + "6b")
                            if (state_instance[0] != selectedState){
                                line.append("td").html((Number(id)+1).toLocaleString())
                                line.append("td").html(state_instance[0])
                                line.append("td").html(state_instance[1].population.home.bad_sewage.toLocaleString(undefined, {minimunFractionDigits: 2, maximumFractionDigits: 2}) + "%")
                            } else {
                                line.append("td").html("<span class='fw-bolder'>" + (Number(id)+1).toLocaleString() + "</span>")
                                line.append("td").html("<span class='fw-bolder'>" + state_instance[0] + "</span>")
                                line.append("td").html("<span class='fw-bolder'>" + state_instance[1].population.home.bad_sewage.toLocaleString(undefined, {minimunFractionDigits: 2, maximumFractionDigits: 2}) + "%" + "</span>")
                            }
                        }
                        break;
                    case "8":
                        d3.select("#lists-select-parent").html("").append("p").attr("class", "h4 fw-bolder mt-3")
                        .html("Estados com mais pobres <br>").append("span").attr("class","lead fs-5").html("Por Porcentagem de Pobres")
                        var table = d3.select("#lists-select-parent").append("table").attr("class","table table-striped lists-table").html('<thead><tr><th scope="col">#</th><th scope="col">Estado</th><th scope="col">Taxa</th><th scope="col">Total</th></tr></thead>')
                        var tbody = table.append("tbody").html("")
                        
                        var aggregateStateList = {}
                        for (var name in new_states) {
                            var state = new_states[name]
                            var s = aggregateState(state)
                            aggregateStateList[name] = s
                        }
                        
                        var sortedList = Object
                        .entries(aggregateStateList)
                        .sort((a, b) => b[1].population.poverty.poor - a[1].population.poverty.poor);
    
                        for (var id in sortedList) {
                            var state_instance = sortedList[id]
                            var line = tbody.append("tr").attr("style", "border-bottom: 0.2rem solid " + state_instance[1].color + "6b")
                            if (state_instance[0] != selectedState){
                                line.append("td").html((Number(id)+1).toLocaleString())
                                line.append("td").html(state_instance[0])
                                line.append("td").html(state_instance[1].population.poverty.poor.toLocaleString(undefined, {minimunFractionDigits: 2, maximumFractionDigits: 2}) + "%")
                                line.append("td").html(numberFormat((state_instance[1].population.poverty.poor/100)*state_instance[1].population.total, 1))
                            } else {
                                line.append("td").html("<span class='fw-bolder'>" + (Number(id)+1).toLocaleString() + "</span>")
                                line.append("td").html("<span class='fw-bolder'>" + state_instance[0] + "</span>")
                                line.append("td").html("<span class='fw-bolder'>" + state_instance[1].population.poverty.poor.toLocaleString(undefined, {minimunFractionDigits: 2, maximumFractionDigits: 2}) + "%" + "</span>")
                                line.append("td").html("<span class='fw-bolder'>" + numberFormat((state_instance[1].population.poverty.poor/100)*state_instance[1].population.total, 1) + "</span>")
                            }
                        }
                        break;
                    case "9":
                        d3.select("#lists-select-parent").html("").append("p").attr("class", "h4 fw-bolder mt-3")
                        .html("Maiores estados <br>").append("span").attr("class","lead fs-5").html("Por Território")
                        var table = d3.select("#lists-select-parent").append("table").attr("class","table table-striped lists-table").html('<thead><tr><th scope="col">#</th><th scope="col">Estado</th><th scope="col">Área (km²)</th></tr></thead>')
                        var tbody = table.append("tbody").html("")
                        
                        var aggregateStateList = {}
                        for (var name in new_states) {
                            var state = new_states[name]
                            var s = aggregateState(state)
                            aggregateStateList[name] = s
                        }
                        
                        var sortedList = Object
                        .entries(aggregateStateList)
                        .sort((a, b) => b[1].area - a[1].area);
    
                        for (var id in sortedList) {
                            var state_instance = sortedList[id]
                            var line = tbody.append("tr").attr("style", "border-bottom: 0.2rem solid " + state_instance[1].color + "6b")
                            if (state_instance[0] != selectedState){
                                line.append("td").html((Number(id)+1).toLocaleString())
                                line.append("td").html(state_instance[0])
                                line.append("td").html(numberFormat(state_instance[1].area, 3))
                            } else {
                                line.append("td").html("<span class='fw-bolder'>" + (Number(id)+1).toLocaleString() + "</span>")
                                line.append("td").html("<span class='fw-bolder'>" + state_instance[0] + "</span>")
                                line.append("td").html("<span class='fw-bolder'>" + numberFormat(state_instance[1].area, 3) + "</span>")
                            }
                        }
                        break;
                    case "10":
                        d3.select("#lists-select-parent").html("").append("p").attr("class", "h4 fw-bolder mt-3")
                        .html("Estados mais densamente povoados <br>").append("span").attr("class","lead fs-5").html("Por Densidade Populacional")
                        var table = d3.select("#lists-select-parent").append("table").attr("class","table table-striped lists-table").html('<thead><tr><th scope="col">#</th><th scope="col">Estado</th><th scope="col">Densidade (hab/km²)</th></tr></thead>')
                        var tbody = table.append("tbody").html("")
                        
                        var aggregateStateList = {}
                        for (var name in new_states) {
                            var state = new_states[name]
                            var s = aggregateState(state)
                            aggregateStateList[name] = s
                        }
                        
                        var sortedList = Object
                        .entries(aggregateStateList)
                        .sort((a, b) => b[1].dens - a[1].dens);
    
                        for (var id in sortedList) {
                            var state_instance = sortedList[id]
                            var line = tbody.append("tr").attr("style", "border-bottom: 0.2rem solid " + state_instance[1].color + "6b")
                            if (state_instance[0] != selectedState){
                                line.append("td").html((Number(id)+1).toLocaleString())
                                line.append("td").html(state_instance[0])
                                line.append("td").html(state_instance[1].dens.toLocaleString(undefined, {minimunFractionDigits: 2, maximumFractionDigits: 2}))
                            } else {
                                line.append("td").html("<span class='fw-bolder'>" + (Number(id)+1).toLocaleString() + "</span>")
                                line.append("td").html("<span class='fw-bolder'>" + state_instance[0] + "</span>")
                                line.append("td").html("<span class='fw-bolder'>" + state_instance[1].dens.toLocaleString(undefined, {minimunFractionDigits: 2, maximumFractionDigits: 2}) + "</span>")
                            }
                        }
                        break;
                    case "11":
                        d3.select("#lists-select-parent").html("").append("p").attr("class", "h4 fw-bolder mt-3").attr("id","headerToEdit")
                        .html("Estados que mais votaram no Lula <br>").append("span").attr("class","lead fs-5").html("Eleição 2022")
                        var table = d3.select("#lists-select-parent").append("table").attr("class","table table-striped lists-table").html('<thead><tr><th scope="col">#</th><th scope="col">Estado</th><th scope="col">Porcentagem</th><th scope="col">Votos</th></tr></thead>')
                        var tbody = table.append("tbody").html("")
                        
                        var aggregateStateList = {}
                        for (var name in new_states) {
                            var state = new_states[name]
                            var s = aggregateState(state)
                            aggregateStateList[name] = s
                        }

                        var sortedList = Object
                        .entries(aggregateStateList)
                        .sort((a, b) => b[1].politics.presidential2022.pLula - a[1].politics.presidential2022.pLula);
    
                        for (var id in sortedList) {
                            var state_instance = sortedList[id]
                            var line = tbody.append("tr").attr("style", "border-bottom: 0.2rem solid " + state_instance[1].color + "6b")
                            if (state_instance[0] != selectedState){
                                line.append("td").html((Number(id)+1).toLocaleString())
                                line.append("td").html(state_instance[0])
                                line.append("td").html(state_instance[1].politics.presidential2022.pLula.toLocaleString(undefined, {minimunFractionDigits: 2, maximumFractionDigits: 2}) + "%")
                                line.append("td").html(numberFormat(state_instance[1].politics.presidential2022.lula, 1))
                            } else {
                                line.append("td").html("<span class='fw-bolder'>" + (Number(id)+1).toLocaleString() + "</span>")
                                line.append("td").html("<span class='fw-bolder'>" + state_instance[0] + "</span>")
                                line.append("td").html("<span class='fw-bolder'>" + state_instance[1].politics.presidential2022.pLula.toLocaleString(undefined, {minimunFractionDigits: 2, maximumFractionDigits: 2}) + "%" + "</span>")
                                line.append("td").html("<span class='fw-bolder'>" + numberFormat(state_instance[1].politics.presidential2022.lula, 1) + "</span>")
                            }
                        }
                        break;
                    case "12":
                        d3.select("#lists-select-parent").html("").append("p").attr("class", "h4 fw-bolder mt-3").attr("id","headerToEdit")
                        .html("Estados que mais votaram no Bolsonaro <br>").append("span").attr("class","lead fs-5").html("Eleição 2022")
                        var table = d3.select("#lists-select-parent").append("table").attr("class","table table-striped lists-table").html('<thead><tr><th scope="col">#</th><th scope="col">Estado</th><th scope="col">Porcentagem</th><th scope="col">Votos</th></tr></thead>')
                        var tbody = table.append("tbody").html("")
                        
                        var aggregateStateList = {}
                        for (var name in new_states) {
                            var state = new_states[name]
                            var s = aggregateState(state)
                            aggregateStateList[name] = s
                        }

                        var sortedList = Object
                        .entries(aggregateStateList)
                        .sort((a, b) => b[1].politics.presidential2022.pBolsonaro - a[1].politics.presidential2022.pBolsonaro);
    
                        for (var id in sortedList) {
                            var state_instance = sortedList[id]
                            var line = tbody.append("tr").attr("style", "border-bottom: 0.2rem solid " + state_instance[1].color + "6b")
                            if (state_instance[0] != selectedState){
                                line.append("td").html((Number(id)+1).toLocaleString())
                                line.append("td").html(state_instance[0])
                                line.append("td").html(state_instance[1].politics.presidential2022.pBolsonaro.toLocaleString(undefined, {minimunFractionDigits: 2, maximumFractionDigits: 2}) + "%")
                                line.append("td").html(numberFormat(state_instance[1].politics.presidential2022.bolsonaro, 1))
                            } else {
                                line.append("td").html("<span class='fw-bolder'>" + (Number(id)+1).toLocaleString() + "</span>")
                                line.append("td").html("<span class='fw-bolder'>" + state_instance[0] + "</span>")
                                line.append("td").html("<span class='fw-bolder'>" + state_instance[1].politics.presidential2022.pBolsonaro.toLocaleString(undefined, {minimunFractionDigits: 2, maximumFractionDigits: 2}) + "%" + "</span>")
                                line.append("td").html("<span class='fw-bolder'>" + numberFormat(state_instance[1].politics.presidential2022.bolsonaro, 1) + "</span>")
                            }
                        }
                        break;
                }
            })
        }
        if (name == selectedState) {
            radio.onclick()
            d3.select(radio).attr("checked", name == selectedState)
        }
        var staten = div3.appendChild(ned("label"))
        staten.className = "form-check-label"
        staten.setAttribute("for", "radioState"+name);
        staten.innerHTML = name
        if (name != "Indefinido") {
            staten.className = "fw-bold fakeBtn editName"
        }

        var input = p.appendChild(ned("input"))
        input.className = "jscolor"
        input.value = state.color
        var me2 = d3.select(input)
        me2.attr("state", name)
        d3.select(input).on("change", function() {
            var me3 = d3.select(this)
            configState(me3.attr("state"), me3.attr("state"), me3.node().value)
        })
    }
}

const stateList = document.getElementById('stateList');

stateList.addEventListener('click', function(event) {
    if (event.target.classList.contains('editName')) {
        editName.call(event.target);
    }
});

function editName(){
    var modal = createModal().querySelector(".modalContent");
    var p = modal.appendChild(ned("p"));
    p.innerHTML = "Novo nome do estado: ";

    var tf = p.appendChild(ned("input"));
    var oldstate = this.innerHTML;
    d3.select(tf).attr("placeholder", oldstate);

    var oldcolor = document.querySelectorAll('input.jscolor[state="'+oldstate+'"]')[0].value;

    var btn = modal.appendChild(ned("button"))
    btn.innerHTML = "Renomear"
    btn.onclick = function() {
        if (tf.value.trim() && tf.value !== oldstate) {
            disposeModal(modal);
            configState(oldstate, tf.value, oldcolor);
        } else {
            alert("Please enter a valid new state name.");
        }
    }
    showModal(modal)
}

function aggregateState(state) {
    var s = {}
    s.population = {
        general: {
            indicators: {},
            age: {},
            sex: {},
        },
        home: {},
        poverty: {},
        economy: {}
    }
    s.politics = {
        presidential2018: {},
        presidential2022: {}
    }
    var init = true,
        totalPop = 0,
        tv22 = 0,
        lula22 = 0,
        bolsonaro22 = 0,
        totalGDP = 0,
        totalHDI = 0,
        popValid = 0,
        statemunicipalities = {}, 
        sorted = [],
        biggestCity = [],
        totalGINI = 0,
        totalLExp = 0,
        totalExpStudy = 0,
        totalRural = 0,
        totalUrban = 0,
        totalExPov = 0,
        totalPov = 0,
        totalVPov = 0,
        totalWater = 0,
        totalGarbage = 0,
        totalBadSewage = 0,
        totalEnergy = 0,
        totalMale = 0,
        totalFemale = 0,
        totalChildren = 0,
        totalTeens = 0,
        totalYAdults = 0,
        totalAdults = 0,
        totalElderly = 0,
        totalArea = 0
    for (var i in state.municipalities) {
        totalPop += full_municipality_data[state.municipalities[i]].population.total
        totalGDP += full_municipality_data[state.municipalities[i]].population.economy.gdp
        totalArea += full_municipality_data[state.municipalities[i]].meta.area
        tv22 += full_municipality_data[state.municipalities[i]].politics.presidential2022.total
        lula22 += full_municipality_data[state.municipalities[i]].politics.presidential2022.lula
        bolsonaro22 += full_municipality_data[state.municipalities[i]].politics.presidential2022.bolsonaro

        if (full_municipality_data[state.municipalities[i]].population.general.indicators.hdi == 0) {
            continue
        } else {
            var citypop = full_municipality_data[state.municipalities[i]].population.total
            popValid += citypop
            totalHDI += (full_municipality_data[state.municipalities[i]].population.general.indicators.hdi * citypop)
            totalGINI += (full_municipality_data[state.municipalities[i]].population.general.indicators.gini * citypop)
            totalLExp += (full_municipality_data[state.municipalities[i]].population.lifeexp * citypop)
            totalExpStudy += (full_municipality_data[state.municipalities[i]].population.exp_years_of_study * citypop)
            totalRural += (full_municipality_data[state.municipalities[i]].population.rural * citypop)
            totalUrban += (full_municipality_data[state.municipalities[i]].population.urban * citypop)
            totalExPov += (full_municipality_data[state.municipalities[i]].population.poverty.extremely_poor * citypop)
            totalPov += (full_municipality_data[state.municipalities[i]].population.poverty.poor * citypop)
            totalVPov += (full_municipality_data[state.municipalities[i]].population.poverty.vulnerability * citypop)
            totalWater += (full_municipality_data[state.municipalities[i]].population.home.water * citypop)
            totalGarbage += (full_municipality_data[state.municipalities[i]].population.home.garbage * citypop)
            totalBadSewage += (full_municipality_data[state.municipalities[i]].population.home.bad_sewage * citypop)
            totalEnergy += (full_municipality_data[state.municipalities[i]].population.home.energy * citypop)
            totalMale += (full_municipality_data[state.municipalities[i]].population.general.sex.male * citypop)
            totalFemale += (full_municipality_data[state.municipalities[i]].population.general.sex.female * citypop)
            totalChildren += (full_municipality_data[state.municipalities[i]].population.general.age.children * citypop)
            totalTeens +=  (full_municipality_data[state.municipalities[i]].population.general.age.teenagers * citypop)
            totalYAdults +=  (full_municipality_data[state.municipalities[i]].population.general.age.youngAdults * citypop)
            totalAdults +=  (full_municipality_data[state.municipalities[i]].population.general.age.adults * citypop)
            totalElderly +=  (full_municipality_data[state.municipalities[i]].population.general.age.elderly * citypop)
        }
    }

    
    for (var city in state.municipalities) {
        statemunicipalities[state.municipalities[city]] = full_municipality_data[state.municipalities[city]]
    }

    sorted = Object
    .entries(statemunicipalities)
    .sort((a, b) => b[1].population.total - a[1].population.total);
    biggestCity = sorted[0]
    
    s.politics.presidential2022.total = tv22
    s.politics.presidential2022.lula = lula22
    s.politics.presidential2022.bolsonaro = bolsonaro22
    s.politics.presidential2022.pLula = roundPct(s.politics.presidential2022.lula / s.politics.presidential2022.total, 2)
    s.politics.presidential2022.pBolsonaro = roundPct(s.politics.presidential2022.bolsonaro / s.politics.presidential2022.total, 2)

    s.population.economy.gdp = totalGDP
    s.population.economy.ppc = totalGDP/totalPop
    s.population.general.indicators.hdi = totalHDI/popValid

    if (s.population.general.indicators.hdi >= 0.800) {
        s.population.general.indicators.hdiLevel = "Muito Alto"
        s.population.general.indicators.hdiColor = "var(--hdi-very-high)"
    } else if (s.population.general.indicators.hdi >= 0.700) {
        s.population.general.indicators.hdiLevel = "Alto"
        s.population.general.indicators.hdiColor = "var(--hdi-high)"
    } else if (s.population.general.indicators.hdi >= 0.550) {
        s.population.general.indicators.hdiLevel = "Médio"
        s.population.general.indicators.hdiColor = "var(--hdi-medium)"
    } else {
        s.population.general.indicators.hdiLevel = "Baixo"
        s.population.general.indicators.hdiColor = "var(--hdi-low)"
    }

    s.population.total = totalPop
    s.area = totalArea
    s.dens = totalPop/totalArea
    s.color = state.color
    s.population.biggestCity = biggestCity
    s.municipalitiesbyPop = sorted
    s.municipalitiesList = statemunicipalities
    s.population.general.indicators.gini = totalGINI/popValid
    s.population.lifeexp = totalLExp/popValid
    s.population.exp_years_of_study = totalExpStudy/popValid
    s.population.rural = totalRural/popValid
    s.population.urban = totalUrban/popValid
    s.population.poverty.extremely_poor = totalExPov/popValid
    s.population.poverty.poor = totalPov /popValid
    s.population.poverty.vulnerability = totalVPov/popValid
    s.population.home.water = totalWater/popValid
    s.population.home.garbage = totalGarbage/popValid
    s.population.home.bad_sewage = totalBadSewage/popValid
    s.population.home.energy = totalEnergy/popValid
    s.population.general.sex.male = totalMale/popValid
    s.population.general.sex.female = totalFemale/popValid
    s.population.general.age.children = totalChildren/popValid
    s.population.general.age.teenagers = totalTeens/popValid
    s.population.general.age.youngAdults = totalYAdults/popValid
    s.population.general.age.adults = totalAdults /popValid
    s.population.general.age.elderly = totalElderly/popValid
    s.init = init
    //s.population.biggestCity = state.municipalities.reduce((max, city) => max.population.total > city.population.total ? max : city);
    return s
}

function numberFormat(num, digits) {
    var si = [
        { value: 1E12,  symbol: " trilhões" },
        { value: 1E9,  symbol: " bilhões" },
        { value: 1E6,  symbol: " milhões" },
        { value: 1E3,  symbol: " mil" }
    ], i;
    for (i = 0; i < si.length; i++) {
      if (num >= si[i].value) {
        return (num / si[i].value).toFixed(digits).replace(/\.0+$|(\.[0-9]*[1-9])0+$/, "$1").replace('.', ',') + si[i].symbol;
      } else if(num < 1000) {
        return round(num, 0)
      }
    }
    return num.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

function reloadMap() {
    console.log("reloads")
    for (var name in new_states) {
        for (var i in new_states[name].municipalities) {
            var municipalityId = new_states[name].municipalities[i]
            //console.log(municipalityId +" is part of " + name)
            //console.log(name+" color: " + new_states[name].color)
            d3.select("path#" + municipalityId).attr("fill", new_states[name].color)
            if (name != "Indefinido") {
                if (!d3.select("#showMunicipalities").node().checked) {
                    d3.select("path#" + municipalityId).style("strokeWidth", "0.1px")
                    d3.select("path#" + municipalityId).style("stroke", "#" + new_states[name].color)
                }
            }
        }
    }
}

function aiGen(no_states = 27, derv = 0.50) {
    for (var id in usMap.features) {
        var municipality = usMap.features[id]
        if (full_municipality_data["BR" + municipality.properties.CD_MUN] == undefined) {
            console.log(municipality.properties.CD_MUN)
        }
        full_municipality_data["BR" + municipality.properties.CD_MUN].neighbors = []
        for (var i in municipality.neighbors) {
            full_municipality_data["BR" + municipality.properties.CD_MUN].neighbors.push("BR" + municipality.neighbors[i].properties.CD_MUN)
        }
    }

    var os = {
        "State 1": {
            population: 0,
            municipalities: []
        },
    }
    var cs = "State 1"
    var csi = 1

    console.log("Beginning alogrithmic state generation")
    var municipalities = new_states["Indefinido"].municipalities
    console.log((municipalities).length + " municipalities to assign into " + no_states + " states")
    console.log("permitted population dervication: " + (derv * 100) + "%")
    var pps = round(aggregateState(new_states["Indefinido"]).population.total / no_states, 0)
    var lpps = round(pps - pps * derv, 0)
    var upps = round(pps + pps * derv, 0)
    console.log("Population Per State: " + pps.toLocaleString())
    console.log("\tLowerbound: " + lpps.toLocaleString())
    console.log("\tUpperbound: " + upps.toLocaleString())

    var touched = []
    var ntt = municipalities.length
    while (touched.length != ntt)
        for (var i in municipalities) {
            var municipality = full_municipality_data[municipalities[i]]
            var id = "BR" + municipality.meta.id
            if (touched.includes(id)) continue
            touched.push(id)
            console.log("considering: " + municipality.meta.name)
            if (os[cs].population + municipality.population.total < upps) {
                touched.push("BR"+municipality.meta.id)
                os[cs].municipalities.push("BR"+municipality.meta.id)
                console.log("Added " + municipality.meta.name + " to " + cs)
            }
            else if (os[cs].population > lpps) {
                console.log("Complete state: " + cs)
                csi++
                cs = "State " + csi
                os[cs] = {
                    population: 0,
                    municipalities: []
                }
            }
        }
        
        return {
    generatedStates: os,
    touchedMunicipalities: touched
}
}

function reload() {
    reloadStateList()
    reloadMap()
    reloadJscolor()
}

/* Handle Events */
d3.select("button#newState").on("click", function() {
    var me = d3.select(this)
    var modal = createModal().querySelector(".modalContent")

    var p1 = modal.appendChild(ned("p"))
    p1.innerHTML = "Nome: "
    var name = p1.appendChild(ned("input"))
    name.className = "ms-1"
    name.required = true;

    var p2 = modal.appendChild(ned("p"))
    p2.innerHTML = "Cor: "
    var color = p2.appendChild(ned("input"))
    color.className = "ms-1 jscolor"
    color.type = "jscolor"

    var btn = modal.appendChild(ned("button"))
    btn.innerHTML = "Criar Estado"
    btn.onclick = function() {
        if (name.value.trim()){
            newState(name.value, "#" + color.value, [])
            disposeModal(modal)
        } else {
            alert("Please enter a valid name.");
        }
    }

    showModal(modal)
    name.focus()

    reloadJscolor()
})

function downloadSave(){
    
}

d3.select("#compressor").on("click", function() {
    var fileName = "Save - Reorganize o Brasil.rbr";
    var fileContent = btoa(JSON.stringify(new_states));
    var myFile = new Blob([fileContent], {type: 'text/plain'});

    window.URL = window.URL || window.webkitURL;

    var modal = createModal().querySelector(".modalContent")
    modal.appendChild(ned("p")).innerHTML = ('<div class="container c-compressor"><p>Baixe o seu save e guarde em um lugar seguro:</p></div>');
    var modalBtn = modal.querySelector(".c-compressor").appendChild(ned("a"));
    modalBtn.innerHTML = ("Baixar");
    modalBtn.id = "download";
    modalBtn.className = "btn";
    modalBtn.setAttribute("download", fileName);  
    modalBtn.setAttribute("href", window.URL.createObjectURL(myFile));

    document.body.appendChild(modal.parentElement)
    modal.parentElement.style.display = 'block'
})

d3.select("#decompressor").on("click", function() {
    var modal = createModal().querySelector(".modalContent")
    var saveLabel = modal.appendChild(ned("label"));
    saveLabel.setAttribute("for", "fileInput");
    saveLabel.innerHTML = "Carregue o arquivo do seu save aqui: ";
    saveLabel.className = "form-label"

    var saveInput = modal.appendChild(ned("input"))
    saveInput.setAttribute("type", "file")
    saveInput.setAttribute("accept", ".rbr")
    saveInput.id = "fileInput"
    saveInput.className = "form-control";

    var btn = modal.appendChild(ned("button"))
    btn.innerHTML = "Carregar"
    btn.id = "loadBtn"

    document.body.appendChild(modal.parentElement)
    modal.parentElement.style.display = 'block'

    btn.onclick = function() {
        const fileInput = document.getElementById('fileInput');
        const saveFile = fileInput.files[0];

        if (saveFile) {
            const reader = new FileReader();
            reader.onload = function(e) {
                var save = e.target.result;

                disposeModal(modal);
                try {
                    new_states = JSON.parse(atob(save));
                    reload();
                } catch (error) {
                    console.error("Failed to parse file content:", error);
                    alert("There was an error processing the file. Please check the file format.");
                }
            };
            reader.readAsText(saveFile);
        } else {
            alert('Please select a file.');
        }
        reload();
    }
})

d3.select("#assignState").on("click", function() {
    console.log("...")
    var modal = createModal().querySelector(".modalContent")
    var formAssign = modal.appendChild(ned("form"))
    var div1 = formAssign.appendChild(ned("div"))
    div1.className = "form-group"
    div1.innerHTML = ('<label for="old-state">Sigla do Antigo Estado:</label><br><small id="emailHelp" class="form-text text-muted">Sigla de um estado real do Brasil. Ex: AC, SP, RJ, PI, etc.</small>')
    var input = div1.appendChild(ned("input"))
    input.setAttribute("id", "old-state")

    var div2 = formAssign.appendChild(ned("div"))
    div2.className = "form-group mt-3 mb-3"
    div2.innerHTML = ('<label for="sub-state">Nome do Novo Estado:</label><br><small id="emailHelp" class="form-text text-muted">Digite o nome de um novo estado que você já criou. Deve ser igual como é o nome dele.</small>')
    var input2 = div2.appendChild(ned("input"))
    input2.setAttribute("id", "sub-state")

    input.style.width = "100%"
    input2.style.width = "100%"

    var btn = modal.appendChild(ned("button"))
    btn.innerHTML = "Atribuir"

    document.body.appendChild(modal.parentElement)
    modal.parentElement.style.display = 'block'
    btn.onclick = function() {
        disposeModal(modal)
        for (var id in full_municipality_data) {
            var fcd = full_municipality_data[id]
            if (fcd.meta.name.endsWith("("+input.value+")")) {
                assignMunicipality(id, input2.value)
            }
        }
        reload()
    }
})

d3.select("#showMunicipalities").on("change", function() {
    var me = d3.select(this).node()
    if (me.checked) {
        var paths = document.getElementsByClassName("municipalityBorders");
        for (var p in paths) {
            var path = paths[p];
            if (typeof(path) != "object") {
                continue
            }
            path.style.stroke = "#3f3f3f"
            path.style.strokeWidth = "0.1px"
        }
        d3.selectAll("path.municipality").each(function(d) {
            var me2 = d3.select(this)

            me2.node().style = ''
        })
    }
    else {
        var paths = document.getElementsByClassName("municipalityBorders");
        for (var p in paths) {
            var path = paths[p];
            if (typeof(path) != "object") {
                continue
            }
            path.style.stroke = "#000"
            path.style.strokeWidth = "0px"
        }
        d3.selectAll("path.municipality").each(function(d) {
            var me2 = d3.select(this)
            var state = new_states[gsci("BR" + d.properties.CD_MUN)]

            me2.style("stroke-width", "0.1px")
            me2.style("stroke", state.color)
        })
    }
})

d3.select("#municipalityColor").on("change", function() {
    var value = fvor("cc")
    var key = d3.select("#mapKey")
    var table = key.select("table")
    var thead = table.select("thead").node()
    thead.innerHTML = ''
    var tbody = table.select("tbody").node()
    tbody.innerHTML = ''
    if (value == "nc") {
        key.style("display", "none")
    }
    else if (value == "race") {
        key.style("display", "block")
        var trh = thead.appendChild(ned("tr"))
        trh.appendChild(ned("th")).innerHTML = "Race"
        trh.appendChild(ned("th")).innerHTML = "Color"


    }
})

d3.select("#showStates").on("change", function() {
    var me = d3.select(this).node()
    if (me.checked) {
        var paths = document.getElementsByClassName("stateBorders");
        for (var p in paths) {
            var path = paths[p];
            if (typeof(path) != "object") {
                //    continue
            }
            if (d3.select("#showMunicipalities").node().checked) {
                path.style.stroke = "var(--stateBorders)"
                path.style.strokeWidth = "0.3px"
            } else {
                path.style.stroke = "var(--stateBorders)"
                path.style.strokeWidth = "0.3px"
            }
        }
    }
    else {
        var paths = document.getElementsByClassName("stateBorders");
        for (var p in paths) {
            var path = paths[p];
            if (typeof(path) != "object") {
                //    continue
            }
            path.style.stroke = "#000000"
            path.style.strokeWidth = "0px"
        }
    }
})

d3.select("body").on("keypress", function(ev) {
    console.log("!")
    if (d3.event.keyCode == 108) {
        var modal = createModal().querySelector(".modalContent")

        var state_values = modal.appendChild(ned("textarea"))
        state_values.style.width = "100%"
        state_values.placeholder = "State Values"
        var color_values = modal.appendChild(ned("textarea"))
        color_values.style.width = "100%"
        color_values.placeholder = "Color Values"

        var btn = modal.appendChild(ned("button"))
        btn.innerHTML = "Load Values"
        btn.onclick = function() {
            var smol = JSON.parse(atob(state_values.value))
            var smol_color = JSON.parse(atob(color_values.value))
            new_states = {}
            for (var s in smol) {
                new_states[s] = {}
                new_states[s].color = "#" + smol_color[s]
                new_states[s].municipalities = []
                for (var i = 0; i < smol[s].length; i++) {
                    new_states[s].municipalities.push(smol[s][i])
                }
            }
            document.body.removeChild(modal.parentElement)
            reload()
        }

        // document.body.appendChild(modal.parentElement)
        modal.parentElement.style.display = 'block'

        keyEngaged = false;
    }
})

var datas = {
    "atlas.csv": undefined,
    "gdp.csv": undefined,
    "area.csv": undefined,
    "eleicoes2022.csv": undefined,
}

/* DATA FUNCTIONS */
function craftXHR(d) {
    xhr = new XMLHttpRequest();
    xhr.open('GET', 'census_data/' + d, true)
    lmsg("Carregando: " + d)
    xhr.send();

    xhr.onload = function(e) {
        if (!this.status == 200) {
            lmsg("Ocorreu um erro carregando " + d);
            lmsg("Código: " + this.status)
            return;
        }

        var data = d3.csvParse(this.response)
        lmsg("Feito! Carregado " + d)
        datas[d] = data
        for (var i in datas) {
            if (datas[i] == undefined) return;
        }

        processCensusData()
    }
}

function processCensusData() {
    lmsg("Processando dados")

    processAgeSex(datas["atlas.csv"])
    processHDI(datas["atlas.csv"])
    processPoverty(datas["atlas.csv"])
    processGDP(datas["gdp.csv"])
    processArea(datas["area.csv"])
    processPolitics(datas["eleicoes2022.csv"])

    lmsg("Dados processados!")
    dataReady = true
    checkAndCloseLoad()
}

function setupMunicipality(id, name) {
    initMunicipality(id)
    full_municipality_data["BR" + id].meta.name = name
}

function round(num, places) {
    var multiplier = Math.pow(10, places);
    return Math.round(num * multiplier) / multiplier;
}

function roundPct(num, places) {
    return round(num * 100, places)
}

function aggregate(arr, pct = false, population = 0, places = 0) {
    var res = 0;
    if (pct) {
        for (var i in arr) {
            res += Number(arr[i])
        }
        return round(res / 100 * population, places)
    }
    else {
        for (var i in arr) {
            res += Number(arr[i])
        }
        return round(res, places)
    }
}

function avg(arr) {
    var t = 0
    for (var i = 0; i < arr.length; i++) { t += arr[i] }
    return t / arr.length
}

function processPolitics(dataset) {
    for (var i = 0; i < dataset.length; i++) {
        var municipality = dataset[i]
        var fcd = full_municipality_data["BR" + municipality["CD_MUN"]]
        fcd.politics.presidential2022.total = Number(municipality["qt_votos_validos"])
        fcd.politics.presidential2022.lula = Number(municipality["qt_votos_lula"])
        fcd.politics.presidential2022.bolsonaro = Number(municipality["qt_votos_bolsonaro"])
        fcd.politics.presidential2022.pLula = roundPct(fcd.politics.presidential2022.lula / fcd.politics.presidential2022.total, 2)
        fcd.politics.presidential2022.pBolsonaro = roundPct(fcd.politics.presidential2022.bolsonaro / fcd.politics.presidential2022.total, 2)
    }
}

function processGDP(dataset) {
    for (var i = 0; i < dataset.length; i++) {
        var municipality = dataset[i]
        var fcd = full_municipality_data["BR" + municipality["CD_MUN"]]
        if (fcd == undefined) {
            setupMunicipality(municipality["CD_MUN"], municipality["NM_MUN"])
            fcd = full_municipality_data["BR" + municipality["CD_MUN"]]
        }
        fcd.population.economy.gdp = Number(municipality["PIB"])*1000
        fcd.population.economy.per_capita = Number(municipality["PPC"])
    }
}

function processArea(dataset) {
    for (var i = 0; i < dataset.length; i++) {
        var municipality = dataset[i]
        var fcd = full_municipality_data["BR" + municipality["CD_MUN"]]
        if (fcd == undefined) {
            setupMunicipality(municipality["CD_MUN"], municipality["NM_MUN"])
            fcd = full_municipality_data["BR" + municipality["CD_MUN"]]
        }
        fcd.meta.area = Number(municipality["AREA"])
        fcd.meta.dens = Number(municipality["DENS"])
    }
}

function processPoverty(dataset) {
    for (var i = 0; i < dataset.length; i++) {
        var municipality = dataset[i]
        var fcd = full_municipality_data["BR" + municipality["CD_MUN"]]
        if (fcd == undefined) {
            setupMunicipality(municipality["CD_MUN"], municipality["NM_MUN"])
            fcd = full_municipality_data["BR" + municipality["CD_MUN"]]
        }
        fcd.population.poverty.extremely_poor = Number(municipality["pind"])
        fcd.population.poverty.poor = Number(municipality["pmpob"])
        fcd.population.poverty.vulnerability = Number(municipality["ppob"])
    }
}

function processAgeSex(dataset) {
    for (var i = 0; i < dataset.length; i++) {
        var municipality = dataset[i]
        var fcd = full_municipality_data["BR" + municipality["CD_MUN"]]
        if (fcd == undefined) {
            setupMunicipality(municipality["CD_MUN"], municipality["NM_MUN"])
            fcd = full_municipality_data["BR" + municipality["CD_MUN"]]
        }
        fcd.population.total = Number(municipality["POP"])
        fcd.population.rural = Number(municipality["t_rural"])
        fcd.population.urban = Number(municipality["t_urbana"])
        fcd.population.lifeexp = Number(municipality["espvida"])
        fcd.population.fertility_rate = Number(municipality["fectot"])
        fcd.population.exp_years_of_study = Number(municipality["e_anosestudo"])
        fcd.population.general.sex.male = Number(municipality["t_homem"])
        fcd.population.general.sex.female = Number(municipality["t_mulher"])
        fcd.population.general.age.children = Number(municipality["t_criancas"])
        fcd.population.general.age.teenagers = Number(municipality["t_adolescentes"])
        fcd.population.general.age.youngAdults = Number(municipality["t_jovem_adultos"])
        fcd.population.general.age.adults = Number(municipality["t_adultos"])
        fcd.population.general.age.elderly = Number(municipality["t_idososmais65"])
        fcd.population.home.water = Number(municipality["t_agua"])
        fcd.population.home.garbage = Number(municipality["t_lixo"])
        fcd.population.home.energy = Number(municipality["t_luz"])
        fcd.population.home.bad_sewage= Number(municipality["agua_esgoto"])
        fcd.population.economy.sectors.agro = Number(municipality["p_agro"])
        fcd.population.economy.sectors.trade = Number(municipality["p_com"])
        fcd.population.economy.sectors.construction = Number(municipality["p_constr"])
        fcd.population.economy.sectors.mining = Number(municipality["p_extr"])
        fcd.population.economy.sectors.manufacturing = Number(municipality["p_transf"])
    }
}

function processHDI(dataset) {
    for (var i = 0; i < dataset.length; i++) {
        var municipality = dataset[i]
        var fcd = full_municipality_data["BR" + municipality["CD_MUN"]]
        if (fcd == undefined) {
            setupMunicipality(municipality["CD_MUN"], municipality["NM_MUN"])
            fcd = full_municipality_data["BR" + municipality["CD_MUN"]]
        }
        fcd.population.general.indicators.hdi = Number(municipality["idhm"])
        fcd.population.general.indicators.gini = Number(municipality["gini"])
    }
}

/* DADOS */
var loadModal = createModal().querySelector(".modalContent")
loadModal.parentElement.style.display = 'block'
document.body.appendChild(loadModal.parentElement)
console.log(loadModal.querySelector("span.fakeBtn"))
loadModal.removeChild(loadModal.querySelector("span.fakeBtn"))

function lmsg(txt) {
    loadModal.appendChild(ned("p")).innerHTML = txt
}

var mapReady = false,
    dataReady = false

function checkAndCloseLoad() {
    if (mapReady && dataReady) {
        disposeModal(loadModal)
    }
}

lmsg("Pegando os dados...")
for (var i in datas) {
    craftXHR(i)
}

/* MAPA */
var width=982,
    height = 650,
    centered;

var svg = d3.select("svg")
    .attr("width", "100%")
    .attr("height", height);
svg.on("click", function() { if (d3.event.defaultPrevented) d3.event.stopPropagation(); }, true);
var g = svg.append("g")

var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var zoom = d3.zoom()
    .scaleExtent([1, 32])
    .on("zoom", function() {
        g.attr("transform", d3.event.transform);
    });

svg.call(zoom)

var usMap, usMapN

d3.json("brasil/BR.json", function(error, br) {
    if (error) throw error;


    usMap = topojson.feature(br, br.objects.municipios),
        usMapN = topojson.neighbors(br.objects.municipios.geometries)

    usMap.features.forEach(function(municipality, i) {

        municipality.distance = Infinity;
        municipality.neighbors = usMapN[i].map(function(j) { return usMap.features[j]; });

    });

    var projection = d3.geoIdentity()
        .reflectY(true)
        .fitSize([width * 0.63,height],topojson.feature(br, br.objects.municipios))
    var path = d3.geoPath().projection(projection);

    lmsg("Desenhando o mapa")

    g
        .attr("class", "municipalities")
        .attr("transform", "translate(180,-1)")
        .selectAll("path")
        .data(topojson.feature(br, br.objects.municipios).features)
        .enter().append("path")
        .attr("d", path)
        .attr("id", function(d) {
            new_states["Indefinido"].municipalities.push("BR" + d.properties.CD_MUN)
            return "BR" + d.properties.CD_MUN
        })
        .attr("area", function(d) {
            return d.properties.AREA_KM2
        })
        .attr("class", "municipality")
        .on("click", function(d) {
            console.log(d.properties.CD_MUN)
            var me = d3.select(this);
            var radios = document.getElementsByName("state")
            for (var i = 0; i < radios.length; i++) {
                var r = radios[i]
                if (r.checked) {
                    assignMunicipality("BR" + d.properties.CD_MUN, r.value)
                    reload()
                    break;
                }
            }
        })
        .on("mouseenter", function(d) {
            tooltip.transition()
                .duration(100)
                .style("opacity", .9);

            var fcd = full_municipality_data["BR" + d.properties.CD_MUN]
            tooltip.append("span").html(fcd.meta.name).style("text-align", "center").append("br").append("br")
            tooltip.append("span").style("text-align", "center").append("b")
                .html(gsci("BR" + fcd.meta.id)).append("br")
            tooltip.append("span")
                .html("População: ").append("b").html(fcd.population.total.toLocaleString()).append("br")
            tooltip.append("span")
                .html("IDHM: ").append("b").html(fcd.population.general.indicators.hdi.toLocaleString(undefined, {minimunFractionDigits: 3, maximumFractionDigits: 3})).append("br")
            tooltip.append("span")
                .html("PIB Per Capita: ").append("b").html(fcd.population.economy.per_capita.toLocaleString("pt-BR", {style:"currency", currency:"BRL"})).append("br")
            
            tooltip
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 48) + "px");
                
        })
        .on("mouseout", function(d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0)
            tooltip.html('')
        })

    g.append("path")
        .attr("class", "municipalityBorders")
        .attr("d", path(topojson.mesh(br, br.objects.municipios, function(a, b) { return a !== b; })))

    g.append("path")
        .datum(topojson.mesh(br, br.objects.estados, function(a, b) { return a !== b; }))
        .attr("class", "stateBorders")
        .attr("d", path)

    g.append("path")
        .datum(topojson.mesh(br, br.objects.pais))
        .attr("class", "countryBorders")
        .attr("d", path)

    mapReady = true
    checkAndCloseLoad()
    lmsg("Mapa desenhado!")
});

/* ABSOLUTE LAST */
reload()

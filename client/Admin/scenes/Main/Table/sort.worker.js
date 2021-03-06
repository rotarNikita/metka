import compose from '../../../../util/compose'

const objectValueByStringKey = (obj, key) => {
    const [firstKey, ...keys] = key.split('.')

    return keys.length === 0 ? obj[firstKey] : objectValueByStringKey(obj[firstKey], keys.join('.'))
}

const convertTypeToNumber = ({ progressType, dates }) => progressType === true ? 3 :
    progressType === false ? 1 :
        dates[0] ? 2 : undefined

const switchSort = (key, sign) => {
    switch(key) {
    case 'enter':
        return (a, b) => !a.dates[0] ? 1 : !b.dates[0] ? -1 :
            sign === '+' ?
                (a.dates[0] > b.dates[0] ? 1 : -1) :
                (a.dates[0] < b.dates[0] ? 1 : -1)
    case 'type':
        return (a, b) => !convertTypeToNumber(a) ? 1 : !convertTypeToNumber(b) ? -1 :
            sign === '+' ?
                (convertTypeToNumber(a) > convertTypeToNumber(b) ? 1 : -1) :
                (convertTypeToNumber(a) < convertTypeToNumber(b) ? 1 : -1)
    default:
        return (a, b) => !objectValueByStringKey(a, key) ? 1 : !objectValueByStringKey(b, key) ? -1 :
            sign === '+' ?
                (objectValueByStringKey(a, key) > objectValueByStringKey(b, key) ? 1 : -1) :
                (objectValueByStringKey(a, key) < objectValueByStringKey(b, key) ? 1 : -1)
    }
}

const sortUsers = ({key, sign}) => users => users
    .sort(switchSort(key, sign))

const spliceUsers = (page, count) => {
    const from = (page - 1) * count
    const to = from + count

    return users => users
        .reduce((users, user, index) => (index >= from && index < to) ? [...users, user] : users, [])
}



self.addEventListener('message', event => {
    const { users, page, count, sort } = JSON.parse(event.data)

    compose(
        sortUsers(sort),
        spliceUsers(page, count),
        JSON.stringify,
        postMessage
    )(users)
})
import {PaginationState , PaginationMeta} from '../services/index'
export const createInitialPaginationState = (): PaginationState => ({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    hasNext: false,
    hasPrev: false,
})
export const normalizeById = <T extends {id : number}>(items : T[]) : Record<number,T> =>{
    return items.reduce((acc,item)=>{
        acc[item.id] = item
        return acc
    },{}as Record<number,T>)
}
export const extractIds = <T extends { id: number }>(items: T[]): number[] => {
    return items.map(item => item.id)
}

export const updatePaginationFromMeta = (meta : PaginationMeta) : PaginationState=> ({
    currentPage: meta.page,
    totalPages: meta.totalPages,
    totalItems: meta.total,
    hasNext: meta.hasNextPage,
    hasPrev: meta.hasPrevPage,
   
})
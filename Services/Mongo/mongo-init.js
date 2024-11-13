/*
Pedro Díaz - Noviembre 2024
    Script de inicialización de MongoDB.
    Creamos DB nombre 'nlp-vitae'
    Creamos colecciones para almacenar los pdfs
    nombre: files
*/

db = db.getSiblingDB('nlp-vitae');
db.create_collection('files');
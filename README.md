# ADC BackEnd Project
*Pembuatan API ADC*

## Contributing
Teman teman ADC yang bisa dan mau bantu pembuatan API ADC boleh ikut gabung untuk membuatnya

##Documentation

### Type yang bisa akses 

> - **Admin** *(User sebagai admin)*
> - **Writer** *(User sebagai writer)*
> - **Authenticated** *(User yang login)*
> - **Everyone** *(Semua orang)*

# Pengunaan API
**Base API** *(misal) api.acd.com:3000/api*

## Authorization
untuk verifikasi user. setiap request di kasih authorization di header.

>***access_token** didapat dari user login -> 'id'*

*contoh **PHP** :*

    <?php
    
    $client = new http\Client;
    $request = new http\Client\Request;
    
    $body = new http\Message\Body;
    $body->addForm(array(
      'data' => 'data yang di kirim'
    ), NULL);
    
    $request->setRequestUrl('http://api.adc.com:3000/api');
    $request->setRequestMethod('POST');
    $request->setBody($body);
    
    $request->setHeaders(array(
      'cache-control' => 'no-cache',
      'authorization' => 'access_token'
    ));
    
    $client->enqueue($request)->send();



##Tambah user
>## **`POST`** /Accounts  *(Admin)*
>#### Send Body
>>##### `data` :
	{
      "picture": "string",
      "phone": "string",
      "steam_url": "string",
      "username": "string",
      "email": "string",
      "status": "string"
    }

##Login
>## **`POST`** /Accounts/login *(Everyone)*
>#### Send Body
>>##### `data ` :
	{
      "username": "string",
      "password": "string"
    }
>#### Return Body
    {
      "id": "string (access_token)",
      "ttl": integer,
      "created": "string",
      "userId": "string"
    }

##Tambah Content
Untuk nambah postingan info, vidio, gambar, dll.
>## **`POST`** /Contents/new  *(Writer | Admin)*
>#### send formData
>> `title ` : `string` *(require)*
>
>> `description ` : `string`
>
>> `picture ` : `string` *(gambar initial content)*
>
>> `data ` : `string` *(require)* *(data posting content)*
	
>#### return body
    {
	  "title": "string",
	  "description": "string",
	  "data": "string",
	  "picture": "string",
	  "views": integer,
	  "publish": boolean,
	  "id": "string",
	  "accountId": "string",
	  "createdAt": "string",
	  "updatedAt": "string"
	}  

## Cari Content by ID
Untuk menampilkan content berdasarkan id.
>## **`GET`** /Contents/{id}/find  *(Everyone)*
>#### send formData
>> `id ` : `string` *(require)*	
>#### return body
    {
      "title": "string",
      "description": "string",
      "data": "string",
      "picture": "string",
      "views": integer,
      "publish": boolean,
      "id": "string",
      "accountId": "string",
      "createdAt": "string",
      "updatedAt": "string",
      "owner": {
	    "picture": "string",
	    "phone": "string",
	    "steam_url": "string",
	    "username": "string",
	    "email": "string",
	    "id": "string",
	    "createdAt": "string",
	    "updatedAt": "string"
      }
    }

## Edit Content by ID
Untuk edit konten berdasarkan id.
>## **`POST`** /Contents/{id}/edit  *(Everyone)*
>#### send formData
>> `id ` : `string` *(require)*
>
>> `title ` : `string` *(require)*
>
>> `description ` : `string`
>
>> `picture ` : `string` *(gambar initial content)*
>
>> `data ` : `string` *(require)* *(data posting content)*
>#### return body
    {
      "title": "string",
      "description": "string",
      "data": "string",
      "picture": "string",
      "views": integer,
      "publish": boolean,
      "id": "string",
      "accountId": "string",
      "createdAt": "string",
      "updatedAt": "string",
    }

## Jumlah Semua Content
Hitung Jumlah Content
>## **`GET`** /Contents/count  *(Writer | Admin)*
>#### return body
    {
  	   "count": 2
    }








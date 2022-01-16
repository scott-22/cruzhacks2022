import React, { Component, useState } from "react";
import { ethers } from "ethers";
import axios from 'axios';
import { Loader } from ".";

const commonStyles = "min-h-[70px] sm:px-0 px-2 sm:min-w-[120px] flex justify-center items-center border-[0.5px] border-gray-400 text-sm font-light text-white";

const Input = ({ placeholder, name, type, value, onChange }) => (
    <input
      onChange={onChange}
      placeholder={placeholder}
      type={type}
      step="0.0001"
      value={value}
      name={value}
      className="my-2 w-full rounded-sm p-2 outline-none bg-transparent text-white border-none text-sm white-glassmorphism"
    />
);

class Publish extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedImage: null,
      imagesrc: null,
      articleTitle: '',
      articleText: '',
      isLoading: false
    };
  }

  getContract = async () => {
    await window.ethereum.send('eth_requestAccounts');
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    let address = (await axios.get('http://127.0.0.1:3001/api/contract/address')).data["address"];
    let abi = (await axios.get('http://127.0.0.1:3001/api/contract/abi')).data;

    console.log(address); console.log(abi);

    const contract = new ethers.Contract(address, abi, signer);
    return contract;
  }

  addImageHash = (imageHash) => {
    let num = ethers.BigNumber.from('0x' + imageHash);
    this.getContract()
      .then(contract => contract.addImage(num))
      .then(res => {
        console.log(res);
      })
      .catch(err => {console.log(err);});
  }

  addArticleHash = (articleHash) => {
    let num = ethers.BigNumber.from('0x' + articleHash);
    this.getContract()
      .then(contract => contract.addArticle(num))
      .then(res => {
        console.log(res);
      })
      .catch(err => {console.log(err);});
  }



  imageSelectedHandler = (event) => {
    if (event.target.files && event.target.files[0])
      this.setState({
        selectedImage: event.target.files[0],
        imagesrc: URL.createObjectURL(event.target.files[0])
      });
    else
      this.setState({
        selectedImage: null,
        imagesrc: null
      });
  
    //   Debug
    console.log(event.target.files[0])

  }

  imageUploadHandler = async () => {
    if (this.state.selectedImage) {
      const fd = new FormData();
      fd.append('image', this.state.selectedImage)
      console.log(fd.get('image'));
      let imghsh = await axios.post(
        'http://127.0.0.1:3001/api/hashimage',
        fd,
        {headers: { 'Content-Type': 'multipart/form-data' }
      });

      let hex = imghsh.data;
      console.log(hex);

      let res = await this.addImageHash(hex);
      console.log(res);
      // TODO: finish loading here
    }
  }

  hash = (string) => {
    const utf8 = new TextEncoder().encode(string);
    return crypto.subtle.digest('SHA-256', utf8).then((hashBuffer) => {
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray
        .map((bytes) => bytes.toString(16).padStart(2, '0'))
        .join('');
      return hashHex;
    });

  }

  articleOnHeadlineChange = (event) => {
    let title = event.target.value;
    this.setState({ articleTitle: title.toLowerCase() });
  }

  articleOnBodyChange = (event) => {
    let text = event.target.value;
    this.setState({ articleText: text });
  }

  articleOnSubmit = async (event) => {
    event.preventDefault();
    if (this.state.articleTitle) {
      console.log(this.state.articleTitle);

      let hex = await this.hash(this.state.articleTitle);
      console.log(hex);

      let res = await this.addArticleHash(hex);
      console.log(res);
      // TODO: finish loading here

      if (this.state.articleText) {
        let langres = await axios.post(
          'http://127.0.0.1:3001/api/languageanalysis',
          { text: this.state.articleText }
        );

        let langdata = langres.data;
        console.log(langdata);
      }
    }
  }

  render() {
    return (
      <div>
        <div className="flex w-full justify-center items-center gradient-bg-services">
          <div className="flex mf:flex-col flex-col items-center justify-between md:p-20 py-12 px-4">
            <div className="flex-1 flex flex-col justify-start items-start">
            </div>

            {/* Publishing Article */}
            <div className="p-5 sm:w-96 w-full flex flex-col justify-start items-center blue-glassmorphism">
                <h3 className="text-white text-3xl py-2 text-gradient ">
                    Publish articles
                </h3>
                <Input placeholder="Article Name" name="article" type="text" onChange={this.articleOnHeadlineChange} />
                <textarea rows="5" cols="30" placeholder="Enter article text (optional)" onChange={this.articleOnBodyChange}/>
                <div className="h-[1px] w-full bg-gray-400 my-2"/>
                    {this.state.isLoading
                     ? (<Loader />)
                     : (
                     <button
                       type="submit"
                       onClick={this.articleOnSubmit}
                       className="text-white w-full mt-2 border-[1px] p-2 border-[#3d4f7c] hover:bg-[#3d4f7c] rounded-full cursor-pointer"
                     >
                       Send now
                     </button>
                    )}

            </div>          
          
          <div className="flex mf:flex-col flex-col items-center justify-between md:p-20 py-12 px-4">
            <div className="flex-1 flex flex-col justify-start items-start">
              <h1 className="text-white text-3xl sm:text-5xl py-2 text-gradient ">
                Publish images
              </h1>
              <p className="text-left my-2 text-white font-light md:w-9/12 w-11/12 text-base">
                Upload your image
              </p>
            </div>

            <div className="text-white w-full mt-2 border-[1px] p-2 border-[#3d4f7c] hover:bg-[#3d4f7c] rounded-full cursor-pointer flex-1 flex flex-col justify-start items-center p-7">
              <button onClick={this.imageUploadHandler}>Upload</button>
            </div>
            <div className="items-center justify-between md:p-12 py-8 px-4 text-white">
              <input type="file" onChange={this.imageSelectedHandler}></input>
            </div> 
          </div>
        </div>
      </div>
    </div>
    );
  }
}
export default Publish;






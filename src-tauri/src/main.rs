#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

extern crate serde;

use std::{convert::TryFrom, error::Error, fmt::Display};
use std::{fs, ptr::null, time::UNIX_EPOCH};

use std::time::Instant;

use serde::Serialize;
use tauri::InvokeError;

#[derive(Debug, serde::Serialize)]
enum MyError {
  FooError,
}
impl Display for MyError {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    write!(f, "my error")
  }
}
#[derive(serde::Serialize)]
enum FsElementGenre {
  File,
  Dir,
}

#[derive(serde::Serialize)]
struct File {
  name: String,
  path: String,
  content: Option<String>,
  preview: Option<String>,
  created_at: u64,
  updated_at: u64,
}

#[derive(serde::Serialize)]
struct Directory {
  name: String,
  path: String,
  children_count: i32,
}

#[derive(serde::Serialize)]
enum FsElement {
  File(File),
  Directory(Directory),
}

#[tauri::command]
async fn list_dir_files(path: String) -> Vec<FsElement> {
  let paths = fs::read_dir(path).unwrap();
  let files: Vec<FsElement> = paths
    .map(|e| e.unwrap())
    .map(|this_path| -> Result<FsElement, Box<dyn Error>> {
      if this_path.metadata()?.is_dir() {
        let children_count = i32::try_from(fs::read_dir(this_path.path())?.count())?;

        Ok(FsElement::Directory(Directory {
          name: this_path.file_name().to_str().unwrap().to_string(),
          path: this_path.path().to_str().unwrap().to_string(),
          children_count,
        }))
      } else {
        let name = this_path.file_name().to_str().expect("yo").to_string();
        let file_path = this_path.path().to_str().expect("yo").to_string();
        let meta = this_path.metadata()?;
        let created_at = meta.created()?.duration_since(UNIX_EPOCH)?.as_secs();
        let updated_at = meta.modified()?.duration_since(UNIX_EPOCH)?.as_secs();

        let content =
          fs::read_to_string(&file_path).expect("Something went wrong reading the file");

        return Ok(FsElement::File(File {
          name,
          path: file_path,
          content: None,
          preview: Some(content.chars().take(100).collect()),
          created_at,
          updated_at,
        }));
      }
    })
    .map(|res| res.unwrap())
    // Filter dot-starting names
    .filter(|elem| match elem {
      FsElement::Directory(dir) => dir.name.get(..1).unwrap() != ".",
      FsElement::File(file) => file.name.get(..1).unwrap() != ".",
    })
    .collect();
  files
}

#[tauri::command]
async fn open_file(path: String) -> File {
  return |path| -> Result<File, Box<dyn Error>> {
    let meta = fs::metadata(&path).unwrap();
    let created_at = meta.created()?.duration_since(UNIX_EPOCH)?.as_secs();
    let updated_at = meta.modified()?.duration_since(UNIX_EPOCH)?.as_secs();

    let content = fs::read_to_string(&path)?;

    Ok(File {
      name: String::from(&path),
      path,
      content: Some(content),
      preview: None,
      created_at,
      updated_at,
    })
  }(path)
  .unwrap();
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![list_dir_files, open_file])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

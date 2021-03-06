#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

extern crate serde;

use notify::{Event, RecommendedWatcher, RecursiveMode, Watcher};
use std::sync::Mutex;
use std::{convert::TryFrom, error::Error, fmt::Display};
use std::{fs, time::UNIX_EPOCH};
use tauri::{Manager, State};

#[derive(Debug, serde::Serialize)]
enum MyError {}

impl Display for MyError {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    write!(f, "my error")
  }
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
    .filter(|p| !p.file_name().to_str().unwrap().starts_with("."))
    .map(|this_path| -> Result<FsElement, Box<dyn Error>> {
      if this_path.metadata()?.is_dir() {
        let children_count = i32::try_from(
          fs::read_dir(this_path.path())?
            .filter(|p| {
              !p.as_ref()
                .unwrap()
                .file_name()
                .to_str()
                .unwrap()
                .starts_with('.')
            })
            .count(),
        )?;

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

        let content = match fs::read_to_string(&file_path) {
          Ok(content) => content,
          Err(_) => String::from(""),
        };

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

// #[tauri::command]
// fn list_path(path: String) -> Vec<String> {
//   let paths = fs::read_dir(path).unwrap();
//   paths
//     .map(|e| e.unwrap())
//     .filter(|p| !p.file_name().to_str().unwrap().starts_with('.'))
//     .map(|p| p.path().to_str().unwrap().to_string())
//     .collect()
// }

fn list_path(path: String, deep: bool) -> Vec<String> {
  let paths = fs::read_dir(path).unwrap();
  let mut all_path = vec![];
  paths // filter out dot-starting path
    .map(|e| e.unwrap())
    .filter(|p| {
      println!("{}", p.file_name().to_str().unwrap());
      !p.file_name().to_str().unwrap().starts_with('.')
    })
    .for_each(|p| {
      let path_string = p.path().to_str().unwrap().to_string();
      if p.metadata().unwrap().is_dir() && deep {
        all_path.extend(list_path(path_string, deep))
      } else {
        all_path.push(path_string);
      }
    });
  all_path
}

#[tauri::command]
fn list_path_deep(path: String, deep: bool) -> Vec<String> {
  list_path(path, deep)
}

#[tauri::command]
fn is_dir(path: String) -> bool {
  fs::metadata(path).unwrap().is_dir()
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
struct Watch(Mutex<RecommendedWatcher>);

#[tauri::command]
async fn watch(path: String, watcher: State<'_, Watch>) -> Result<(), ()> {
  println!("Watching {}", &path);
  watcher
    .0
    .lock()
    .unwrap()
    .watch(path, RecursiveMode::Recursive)
    .unwrap();

  Ok(())
}

#[tauri::command]
async fn unwatch(path: String, watcher: State<'_, Watch>) -> Result<(), ()> {
  println!("Stop watching {}", &path);

  watcher.0.lock().unwrap().unwatch(path).unwrap();

  Ok(())
}

fn main() {
  tauri::Builder::default()
    .setup(|app| {
      // attach a file watcher at app setup
      let handle = app.handle();

      let w = Watcher::new_immediate(move |res: Result<Event, _>| match res {
        Ok(event) => {
          handle
            .emit_all("file_changed", event.paths[0].to_str().unwrap().to_string())
            .unwrap();
        }
        Err(e) => {
          println!("watch error: {:?}", e);
        }
      })
      .unwrap();

      let watcher: Mutex<RecommendedWatcher> = Mutex::new(w);

      app.manage(Watch(watcher));

      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      list_dir_files,
      open_file,
      watch,
      unwatch,
      list_path_deep,
      is_dir
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
